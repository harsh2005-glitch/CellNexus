# 🎯 CellNexus — Accenture Interview Preparation Guide

> **Project**: CellNexus — Cellular Network Dashboard  
> **Stack**: React.js · Node.js · Express.js · MySQL · Socket.io · Google Maps API  
> **Prepared for**: Accenture Technical Interview

---

## 📌 PART 1 — PROJECT OVERVIEW (Start Here!)

### Q1. Tell me about this project in 2 minutes.
**Model Answer:**
> "CellNexus is a full-stack, real-time cellular network monitoring dashboard. The problem it solves is that telecom network operators had no centralized visual tool to monitor the health of cell towers across India — they relied on raw CSV logs and delayed reports.
>
> I built a system where live telemetry data is pushed to a React frontend every 3 seconds via WebSocket (Socket.io). The map shows each tower's location using the Google Maps API, with color-coded markers — green for healthy, amber for degraded, red for offline. Operators can click a tower to see live call statistics charts (answered vs blocked vs dropped calls). There's also an Admin Panel for full CRUD management of towers, and a Network Recommender that uses the Haversine formula to suggest the best operator for a user's location.
>
> The backend is Node.js + Express with a MySQL database (hosted optionally on Aiven cloud), and the frontend is React + Vite + TailwindCSS."

---

### Q2. What problem does this project solve?
- Telecom operators need to monitor hundreds of towers in real-time
- Raw CSV data is unreadable at a glance
- No geographical context in existing tools
- CellNexus provides **visual, real-time, geographical monitoring** on a single dashboard
- Operators can identify OFFLINE/DEGRADED towers instantly from map colors

---

### Q3. Who are the users / stakeholders of this system?
| Role | Access | What they do |
|------|--------|--------------|
| **Network Operator** | Dashboard (no login needed) | Monitor towers, view live call stats, use recommender |
| **Admin** | Login required (JWT) | Add/edit/delete towers via Admin Panel |
| **Developer** | Separate panel | View system internals (developer view) |

---

## 📌 PART 2 — SYSTEM ARCHITECTURE

### Q4. Explain the architecture of your project.
```
┌──────────────────────────────────────────┐
│              CLIENT (Browser)            │
│  React + Vite + TailwindCSS              │
│  Google Maps API · Recharts · Framer     │
│  Socket.io-client · Axios                │
└──────────────┬───────────────────────────┘
               │  HTTP (REST APIs) + WebSocket
               ▼
┌──────────────────────────────────────────┐
│            SERVER (Node.js)              │
│  Express.js REST API                     │
│  Socket.io Server (real-time emission)   │
│  CSV Parser (callstats_900.csv)          │
│  bcryptjs · jsonwebtoken                 │
└──────────────┬───────────────────────────┘
               │  mysql2/promise (connection pool)
               ▼
┌──────────────────────────────────────────┐
│         DATABASE (MySQL)                 │
│  Tables: Towers, Telemetries,            │
│          Users, SpeedTests               │
└──────────────────────────────────────────┘
```

**Key points to mention:**
- Decoupled Client-Server architecture
- REST for CRUD operations, WebSocket for real-time push
- Connection pool (limit: 10) for efficient DB usage
- `.env` file for secrets (DB credentials, JWT secret, API keys)

---

### Q5. What is the data flow when the app loads?
1. React app loads → `useJsApiLoader` fetches Google Maps SDK
2. `useEffect` fires → `axios.get('/api/towers')` fetches all towers from MySQL
3. `socket.io` connection established with backend
4. Backend starts a `setInterval(3000ms)` per connected client
5. Every 3 seconds: server reads CSV row → calculates telemetry → inserts into `Telemetries` table → emits `telemetry_update` event
6. Frontend socket listener updates tower statuses + metrics in React state
7. User clicks tower → `CallStatsChart` polls `/api/towers/:id/telemetry` every 3s

---

### Q6. Why did you use WebSockets instead of HTTP polling?
- **HTTP polling**: Client sends request every N seconds — wasteful, adds latency
- **WebSockets (Socket.io)**: Persistent bidirectional connection — server **pushes** data when ready
- Lower overhead, true real-time feel
- Socket.io adds fallback to long-polling if WebSocket unavailable (handles firewalls)
- `clearInterval` on disconnect prevents memory leaks

---

## 📌 PART 3 — BACKEND DEEP DIVE

### Q7. Explain your REST API structure.
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/towers` | Fetch all towers |
| GET | `/api/towers/:id` | Fetch single tower |
| GET | `/api/towers/:id/telemetry` | Get last 20 telemetry records |
| POST | `/api/towers` | Create new tower |
| PUT | `/api/towers/:id` | Update tower |
| DELETE | `/api/towers/:id` | Delete tower + its telemetry |
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login, receive JWT |
| GET | `/api/auth/me` | Get current user (JWT protected) |
| GET | `/api/speed-tests/ping` | Latency test |
| GET | `/api/speed-tests/download` | Download speed test |
| POST | `/api/speed-tests/upload` | Upload speed test |
| GET | `/api/health` | Health check |

---

### Q8. How does your authentication work?
- **Registration**: Password hashed with `bcryptjs` (salt rounds = 10) → stored in MySQL
- **Login**: Password compared with `bcrypt.compare()` → JWT signed with 24h expiry
- **JWT payload**: `{ id, username, email, role }`
- **Protected routes**: Middleware `verifyToken` extracts `Bearer <token>` from `Authorization` header
- **Admin routes**: `verifyAdmin` middleware chains `verifyToken` + role check
- **Frontend storage**: Token and user object stored in `localStorage`

**Follow-up: Why bcrypt?**
> bcrypt is a one-way hashing function with a built-in salt — it prevents rainbow table attacks. The salt rounds (cost factor = 10) means it does 2^10 = 1024 hashing iterations, making brute-force impractical.

**Follow-up: Why JWT over sessions?**
> JWT is stateless — the server doesn't need to store session state. It's ideal for APIs and scales horizontally. The token carries its own expiry (`expiresIn: '24h'`).

---

### Q9. How does your "Geographical Data Slicing" algorithm work?
This is a custom algorithm I designed to simulate realistic per-tower telemetry.

**Steps:**
1. Server loads `callstats_900.csv` (900 rows) into memory on startup
2. On first client connection, fetches all towers from DB
3. **Slicing**: Divides 900 rows equally among all towers — e.g., 30 towers → 30 rows each
4. Each tower gets a `cursor` object: `{ startIndex, endIndex, currentOffset }`
5. Every 3 seconds, each tower reads its **next row** using its cursor (loops back on overflow)
6. Data is extracted: `incomingCalls`, `answeredCalls`, `responseTime`
7. Results inserted into `Telemetries` table, broadcast via Socket.io

**Why this is smart:**
- Ensures each tower gets **different** data (no two towers are in sync)
- Loops seamlessly — no gaps in the chart
- Generates a `tower_data_mapping.txt` file for academic verification
- Scales automatically — more towers = smaller slice per tower

---

### Q10. How do you handle the DELETE operation safely?
```javascript
// Delete child telemetry rows first to avoid FK constraint errors
await pool.execute('DELETE FROM Telemetries WHERE towerId = ?', [req.params.id]);
await pool.execute('DELETE FROM Towers WHERE id = ?', [req.params.id]);
```
- Foreign key constraint: `Telemetries.towerId` references `Towers.id`
- Must delete children first, then parent (cascade manually since no `ON DELETE CASCADE` defined in schema)

---

### Q11. What is a connection pool and why did you use it?
- A connection pool maintains a set of reusable DB connections (`connectionLimit: 10`)
- Without pooling: every request opens + closes a new TCP connection (slow, resource-heavy)
- With pooling: requests borrow an existing connection, return it after use
- `queueLimit: 0` means unlimited queuing if all 10 connections are busy
- Used `mysql2/promise` for async/await compatibility

---

### Q12. Explain your DB schema.
```sql
-- Towers: Core entity — cell tower metadata
CREATE TABLE Towers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  radio VARCHAR(255),        -- e.g., '4G'
  operatorName VARCHAR(255), -- e.g., 'Jio', 'Airtel'
  mcc INT,                   -- Mobile Country Code (India = 404)
  mnc INT,                   -- Mobile Network Code (operator-specific)
  longitude FLOAT,
  latitude FLOAT,
  coverageRadius INT DEFAULT 1000, -- meters
  cid INT,                   -- Cell ID
  locationName VARCHAR(255), -- city name
  status VARCHAR(255) DEFAULT 'GOOD'
);

-- Telemetries: Time-series telemetry linked to towers
CREATE TABLE Telemetries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  towerId INT NOT NULL,      -- FK to Towers
  latency INT,               -- response time in seconds
  callTotal INT,
  callAccepted INT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users: Auth table
CREATE TABLE Users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  password VARCHAR(255),     -- bcrypt hash
  role ENUM('admin', 'viewer') DEFAULT 'viewer',
  createdAt TIMESTAMP
);
```

---

## 📌 PART 4 — FRONTEND DEEP DIVE

### Q13. Explain your React component structure.
```
App.jsx (root state manager)
├── RoleSelector.jsx       — Landing page with 3 role cards + background map
├── AuthModal.jsx          — Login/Register modal with JWT
├── Header.jsx             — Filters, speed test trigger, navigation
├── MetricsGrid.jsx        — 5 KPI cards (towers, users, download, upload, latency)
├── MapView.jsx            — Google Maps with tower markers + coverage circles
├── TowerList.jsx          — Scrollable tower list (filtered)
├── TowerDetail.jsx        — Tower info panel on selection
├── CallStatsChart.jsx     — Recharts area chart for live telemetry
├── AdminPanel.jsx         — Full CRUD tower management
├── NetworkRecommenderModal.jsx — Best operator calculator
├── DeveloperPanel.jsx     — Developer view
└── SpeedTestModule.jsx    — Speed test UI
```

---

### Q14. How does state management work in your app?
- Used **React's built-in `useState` and `useEffect`** — no Redux/Zustand
- App.jsx is the **single source of truth** for:
  - `towers[]` — all tower data
  - `selectedTower` — currently selected tower
  - `globalMetrics` — aggregated KPIs
  - `currentView` — which screen to render
  - `currentUser` — logged-in user object
- State is passed down as **props** to child components
- Children communicate upward via **callback props** (e.g., `onSelectTower`, `onTowersChanged`)

**Why not Redux?**
> The app is medium complexity — React's built-in state is sufficient. Redux would add boilerplate without meaningful benefit here.

---

### Q15. Explain how real-time updates work on the frontend.
```javascript
// In App.jsx useEffect:
socket.on('telemetry_update', (updates) => {
  setTowers(prevTowers => {
    const newTowers = [...prevTowers]; // shallow copy for immutability
    updates.forEach(update => {
      const idx = newTowers.findIndex(t => t.id === update.towerId);
      if (idx !== -1) {
        // Calculate drop probability from telemetry
        const droppingProb = ...;
        let newStatus = 'GOOD';
        if (droppingProb > 0.10) newStatus = 'OFFLINE';
        else if (droppingProb > 0.07) newStatus = 'DEGRADED';
        // Only trigger re-render if status actually changed
        if (newTowers[idx].status !== newStatus) {
          newTowers[idx] = { ...newTowers[idx], status: newStatus };
          needsUpdate = true;
        }
      }
    });
    return needsUpdate ? newTowers : prevTowers; // avoids unnecessary re-renders
  });
});
```
**Key optimization**: Returns `prevTowers` unchanged if no status changed → no unnecessary re-render.

---

### Q16. What is the Haversine formula and where did you use it?
```javascript
// In NetworkRecommenderModal.jsx
function getHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat/2)**2 +
            Math.cos(lat1*(Math.PI/180)) * Math.cos(lat2*(Math.PI/180)) *
            Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}
```
- Calculates the **great-circle distance** between two GPS coordinates on Earth's surface
- Used in **Network Recommender**: given user's GPS location, calculates distance to every tower, groups by operator, scores on proximity + status (GOOD towers preferred) → recommends best operator

---

### Q17. How does the Google Maps integration work?
- Used `@react-google-maps/api` library
- `useJsApiLoader` hook loads Google Maps JS SDK **once** at app root level (passed as `isLoaded` prop down to components)
- `GoogleMap` component renders the map
- **Custom tower markers**: Rendered as `OverlayView` (DOM elements overlaid on map) — not default Google markers — for full CSS/animation control
- **Coverage circles**: `Circle` component with radius scaled by tower status
- **InfoWindow**: Popup on tower click showing name, operator, status, radius
- **Dark theme**: Applied via `styles` array in `MAP_OPTIONS` — 17 custom style rules

---

### Q18. Explain the tower status thresholds and visual mapping.
| Status | Color | Coverage Radius | Trigger |
|--------|-------|----------------|---------|
| GOOD | Green (#059669) | 100% | Drop probability ≤ 7% |
| DEGRADED | Amber (#D97706) | 60% | Drop probability 7–10% |
| OFFLINE | Red (#DC2626) | 15% | Drop probability > 10% |

- Drop probability = `droppedHandoff / totalHandoffIncoming`
- Handoff calls = 30% of all incoming (industry approximation)
- If drop probability > 10% → red alert pulse animation triggers in `CallStatsChart`

---

### Q19. What is the speed test feature and how does it work?
Three-phase test implemented entirely in the browser:
1. **Ping/Latency**: Time an HTTP GET to `/api/speed-tests/ping` using `performance.now()`
2. **Download**: Fetch a 2MB binary from `/api/speed-tests/download`, stream it using `ReadableStream` reader, measure time → calculate Mbps
3. **Upload**: POST a 1MB `Uint8Array` to `/api/speed-tests/upload`, measure round-trip time → calculate Mbps

**Clamping**: On localhost (memory loopback), speeds can be artificially high (>120 Mbps). Values outside realistic 4G/5G range are replaced with realistic random values (45–95 Mbps download, 14–35 Mbps upload).

---

## 📌 PART 5 — DATABASE & SQL QUESTIONS

### Q20. Write the SQL to get the last 20 telemetry records for a tower.
```sql
SELECT * FROM Telemetries 
WHERE towerId = ? 
ORDER BY timestamp DESC 
LIMIT 20;
```
*(Then reversed in code for chronological chart display)*

### Q21. How would you optimize this query for scale?
```sql
-- Add index on towerId + timestamp for fast lookup
CREATE INDEX idx_telemetries_tower_time ON Telemetries(towerId, timestamp);
```

### Q22. What is MCC and MNC?
- **MCC** = Mobile Country Code — India is `404`
- **MNC** = Mobile Network Code — operator-specific:
  - Jio: 92 (older: 5, 10, etc.)
  - Airtel: 10, 31, 43, etc.
  - Vi (Vodafone-Idea): 20, 27, etc.
  - BSNL: 74, 75

### Q23. Why did you use `mysql2/promise` instead of raw `mysql`?
- `mysql2` is a newer, faster driver with native prepared statement support
- `/promise` variant provides Promise-based API for `async/await` usage
- Prevents callback hell
- `pool.execute()` uses prepared statements → prevents SQL injection by parameterizing `?` placeholders

---

## 📌 PART 6 — SECURITY QUESTIONS

### Q24. How did you prevent SQL injection?
- Used **parameterized queries** with `?` placeholders throughout:
  ```javascript
  pool.execute('SELECT * FROM Towers WHERE id = ?', [req.params.id]);
  ```
- The `mysql2` driver separates SQL structure from data — user input is never interpolated into the query string

### Q25. How do you protect your admin routes?
- JWT middleware `verifyToken` checks `Authorization: Bearer <token>` header
- `verifyAdmin` additionally checks `req.user.role === 'admin'`
- 401 returned if no token, 403 if invalid/expired, 403 if non-admin

### Q26. What security improvements could you make?
1. **HTTPS** — currently runs on HTTP (dev environment)
2. **Rate limiting** — `express-rate-limit` to prevent brute-force on `/api/auth/login`
3. **Refresh tokens** — replace 24h JWT with short-lived access + long-lived refresh token
4. **CORS restriction** — currently `origin: '*'`; should whitelist specific frontend domain
5. **Helmet.js** — HTTP security headers (X-XSS-Protection, Content-Security-Policy)
6. **Input validation** — add Joi or Zod schema validation on all POST/PUT routes
7. **Password policy** — enforce minimum length, complexity
8. **Environment secrets** — JWT_SECRET should always come from env, never have a fallback hardcoded

---

## 📌 PART 7 — PERFORMANCE & SCALABILITY

### Q27. What happens if 100 clients connect simultaneously?
- Each client connection creates its own `setInterval(3000ms)` on the server
- 100 clients = 100 intervals → 100 DB queries every 3 seconds = ~33 queries/sec
- **Problem**: Not scalable!
- **Better approach**: Use `io.emit()` to broadcast to ALL clients from one shared interval (not per-socket)
- Current code uses `socket.emit()` (per socket) — this is a known limitation I'm aware of

### Q28. How would you scale this application?
1. **Shared broadcast**: Replace per-socket interval with one global interval → `io.emit('telemetry_update', updates)`
2. **Redis Pub/Sub**: For multi-server deployments — Socket.io adapter for Redis
3. **Read replicas**: MySQL read replica for telemetry queries
4. **Caching**: Redis cache for `GET /api/towers` (towers don't change often)
5. **Message queue**: Kafka/RabbitMQ for telemetry ingestion pipeline
6. **CDN**: Serve static React bundle from CDN

### Q29. Why did you choose MySQL over MongoDB for this project?
- Tower data and telemetry have a **clear relational structure** with FK constraints
- SQL gives **strong consistency** — important for telemetry data integrity
- **Aggregation queries** (e.g., avg latency per tower) are natural in SQL
- MongoDB would work too, but the structured schema here favors a RDBMS

---

## 📌 PART 8 — REACT / FRONTEND CONCEPTS

### Q30. What is `useCallback` and where did you use it?
```javascript
// In MapView.jsx
const onLoad = useCallback((map) => {
  mapRef.current = map;
}, []);
```
- `useCallback` memoizes a function — same function reference across renders
- Without it, a new `onLoad` function is created every render
- Google Maps API checks if the `onLoad` prop changes — memoization prevents unnecessary re-mounting of the map

### Q31. What is `useRef` and why is it used in MapView?
```javascript
const mapRef = useRef(null);
// After map loads:
mapRef.current = map; // stores Google Map instance
// To pan programmatically:
mapRef.current.panTo({ lat, lng });
```
- `useRef` holds a mutable value that does **not trigger re-renders** when changed
- Perfect for storing DOM nodes and third-party library instances (like the Google Map)

### Q32. Why use `AnimatePresence` and `motion` from Framer Motion?
- `motion.div` with `initial/animate/transition` props adds CSS animations declaratively
- `AnimatePresence` enables **exit animations** — components animate out before unmounting
- Used for smooth view transitions (role select → dashboard) and modal open/close

### Q33. What is Vite and why use it over Create React App?
- **Vite**: Modern build tool using native ES modules in development — near-instant HMR (Hot Module Replacement)
- **CRA**: Old Webpack-based — slow cold start, slow HMR
- Vite uses Rollup for production builds (optimized, tree-shaken)
- `VITE_` prefix required for env vars exposed to browser (prevents accidental secret exposure)

---

## 📌 PART 9 — ALGORITHMS & LOGIC

### Q34. How do you calculate call blocking vs dropping probability?
```javascript
// From telemetry: total incoming and answered
const answerRate = totalIncoming > 0 ? totalAnswered / totalIncoming : 1;

// New calls = 70% of total, Handoff calls = 30% (industry approximation)
const incomingNew = totalIncoming * 0.7;
const incomingHandoff = totalIncoming * 0.3;

// Apply answer rate to each category
const answeredNew = Math.round(incomingNew * answerRate);
const answeredHandoff = Math.round(incomingHandoff * answerRate);

// Failures
const blockedNew = Math.max(0, incomingNew - answeredNew);
const droppedHandoff = Math.max(0, incomingHandoff - answeredHandoff);

// Probabilities
const blockingProb = blockedNew / incomingNew;
const droppingProb = droppedHandoff / incomingHandoff;
```

### Q35. What's the difference between call blocking and call dropping?
| | Call Blocking | Call Dropping |
|-|---------------|---------------|
| When | New call attempt | During active call (handoff) |
| Cause | All channels busy | User moves between cell boundaries |
| Metric | Blocking Probability | Dropping Probability |
| User impact | "Network busy" | "Call disconnected" |
| Severity | Less critical | More critical (worse UX) |

---

## 📌 PART 10 — TOOLS, LIBRARIES & DEPLOYMENT

### Q36. What is Nodemon?
- A dev-only tool that watches for file changes and automatically restarts Node.js server
- Avoids manually stopping/starting server on every code change
- Configured in `package.json` as `"dev": "nodemon server.js"`

### Q37. What is dotenv and why is it critical?
- Loads environment variables from `.env` file into `process.env`
- Keeps secrets (DB password, JWT secret, API keys) out of source code
- `.env` is in `.gitignore` — never committed to Git
- In production, env vars are set directly on the server/cloud platform

### Q38. What is `csv-parser` and how did you use it?
```javascript
const csvDataList = [];
fs.createReadStream(path.join(__dirname, 'callstats_900.csv'))
  .pipe(csv())
  .on('data', (row) => csvDataList.push(row))
  .on('end', () => console.log('Loaded 900-row CSV'));
```
- Streams CSV file line-by-line (memory-efficient for large files)
- Each row becomes an object with column headers as keys
- Loaded once at startup into `csvDataList[]` array in memory

### Q39. What external APIs did you use?
- **Google Maps JavaScript API**: Map rendering, OverlayView markers, InfoWindow, Circle overlays
- **Browser Geolocation API** (`navigator.geolocation.getCurrentPosition`): User's GPS coordinates for Network Recommender
- **`performance.now()`**: High-resolution timing for speed test measurement

### Q40. Where is/was the database hosted?
- **Local development**: MySQL on localhost (port 3306)
- **Cloud option**: Aiven MySQL (managed cloud DB) — `push_to_aiven.js` script pushes data
- DB credentials, host, port, and SSL flag configured via `.env` variables

---

## 📌 PART 11 — CHALLENGING QUESTIONS

### Q41. What was the hardest part of building this project?
**Suggested answer:**
> "The hardest part was designing the Geographical Data Slicing algorithm. I needed each tower to have independent, realistic, continuously updating telemetry without needing real telecom data. The challenge was that if I used random values, the charts would jump erratically. Instead, I divided a real 900-row CSV dataset across all towers like slices of a pie — each tower 'consumes' its own portion of real historical data sequentially, creating natural variation. The cursor system loops seamlessly, so graphs never stall. I also had to handle the async initialization problem — the CSV might not be fully loaded when the first socket connection arrives, so I implemented a `towerMappingInitialised` flag."

### Q42. What would you improve if given more time?
1. Shared global broadcast interval (not per-socket) for scalability
2. Role-based access on tower CRUD (currently no auth middleware on PUT/DELETE)
3. Unit tests with Jest for backend routes
4. Docker-compose setup for easy deployment
5. Notification system (email/SMS) when a tower goes OFFLINE
6. Historical analytics — trends over days/weeks with date range picker

### Q43. How does your app handle errors?
- **Backend**: All async route handlers wrapped in `try/catch`, returning appropriate HTTP codes (400, 401, 403, 404, 500)
- **Frontend speed test**: Multiple nested try/catch blocks — if download test fails, falls back to realistic random values
- **Socket errors**: Simulation errors caught and logged without crashing the server
- **DB initialization**: If DB connection fails, error is logged; server continues

### Q44. Why did you remove Sequelize and use raw SQL?
- Sequelize ORM adds abstraction but also complexity and overhead
- Raw SQL gives **full control** over queries (important for performance-critical telemetry inserts)
- Easier to debug — you see exactly what query runs
- `mysql2`'s prepared statements provide SQL injection protection without needing an ORM

---

## 📌 PART 12 — HR / BEHAVIORAL QUESTIONS

### Q45. What did you learn from building this project?
- WebSocket architecture for real-time applications
- JWT authentication flow from scratch
- MySQL connection pooling and prepared statements
- Custom SVG animation with CSS keyframes
- Google Maps API advanced usage (OverlayView, custom styles)
- Designing algorithms (Haversine, Data Slicing) for real-world problems

### Q46. How did you test this project?
- **Manual testing**: Ran both frontend and backend locally, tested all API endpoints via Postman
- **End-to-end flow**: Verified login, admin CRUD, real-time socket updates, speed test, recommender
- **Edge cases**: Empty tower list, CSV load failure fallback values

### Q47. Is this project deployed anywhere?
> "The backend can be deployed on any Node.js host (Railway, Render, AWS EC2). The database has a cloud option via Aiven. The frontend builds to static files via `vite build` and can be hosted on Vercel/Netlify. Currently it runs locally for demonstration."

---

## 📌 TECH STACK SUMMARY

| Category | Technology | Purpose |
|----------|-----------|---------|
| Frontend | React 19 + Vite 7 | UI framework + build tool |
| Styling | TailwindCSS 4 | Utility-first CSS |
| Animations | Framer Motion | Page/component transitions |
| Maps | Google Maps API | Interactive map |
| Charts | Recharts | Real-time area charts |
| HTTP Client | Axios | REST API calls |
| Real-time | Socket.io-client | WebSocket connection |
| Icons | Lucide React | Icon library |
| Backend | Node.js + Express 5 | REST API server |
| Real-time | Socket.io | WebSocket server |
| Database | MySQL + mysql2 | Relational data storage |
| Auth | bcryptjs + JWT | Password hashing + tokens |
| CSV | csv-parser | Streaming CSV parsing |
| Dev Tools | Nodemon | Auto-restart on change |
| Env Config | dotenv | Environment variables |

---

## 📌 KEY NUMBERS TO MEMORIZE

| Fact | Value |
|------|-------|
| Real-time update interval | Every **3 seconds** |
| CSV rows for simulation | **900 rows** |
| Tower count in DB | **37 towers** (Jio, Airtel, Vi, BSNL) |
| JWT expiry | **24 hours** |
| bcrypt salt rounds | **10** |
| DB connection pool limit | **10 connections** |
| Download test size | **2 MB** |
| Upload test size | **1 MB** |
| Drop threshold → OFFLINE | **> 10%** |
| Drop threshold → DEGRADED | **> 7%** |
| DEGRADED coverage radius | **60%** of normal |
| OFFLINE coverage radius | **15%** of normal |
| Handoff call % of total | **30%** |
| Earth radius (Haversine) | **6371 km** |
| India MCC | **404** |

---

> **Good luck for your Accenture interview! 🚀**  
> Remember: Speak confidently, relate each answer back to a specific design decision you made.
