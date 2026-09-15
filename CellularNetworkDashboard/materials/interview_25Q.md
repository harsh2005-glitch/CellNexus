# 📡 CellNexus — 25 Interview Questions (Complete Answers)

> **Project:** CellNexus — Real-Time Cellular Network Monitoring Dashboard
> **Stack:** React 19 + Vite · Node.js + Express 5 · MySQL · Socket.io · Google Maps API
> **Prepared for:** Accenture Technical Interview

---

## Q1. Explain your project from start to finish.

**CellNexus** is a full-stack, real-time cellular network monitoring dashboard built for telecom network operators.

**The app has three sides:**

**1. Public Dashboard (no login required):**
- An interactive Google Maps view showing all cell towers across India
- Color-coded tower markers — Green (GOOD), Amber (DEGRADED), Red (OFFLINE)
- Live call statistics charts updated every 3 seconds via WebSocket
- Coverage radius circles that shrink when a tower degrades
- MetricsGrid with KPI cards: total towers, active users, download/upload speed, latency
- Network Recommender — uses your GPS + Haversine formula to find the best operator near you
- Speed Test module measuring real-time download, upload, and ping

**2. Admin Panel (JWT-protected login required):**
- Full CRUD for managing towers (Add, Edit, Delete)
- Only users with `role: 'admin'` can access this section

**3. Developer Panel:**
- Internal view of system state for debugging and demonstration

**The complete journey of the system:**
1. Server starts → loads 900-row `callstats_900.csv` into memory → initializes tower-data mapping
2. Client opens browser → React app loads → fetches all towers from MySQL via REST API
3. Socket.io connection established → server starts 3-second interval
4. Every 3 seconds: server reads the next CSV row for each tower → calculates telemetry → inserts into `Telemetries` table → emits `telemetry_update` to client
5. React receives Socket.io event → updates tower statuses on the map → re-renders only changed towers
6. If a tower's drop probability exceeds threshold → its map marker turns red, coverage circle shrinks

---

## Q2. What problem does your project solve?

**Three real problems this solves:**

**Problem 1 — No Visual, Real-Time Monitoring:**
Telecom operators traditionally relied on raw CSV logs and delayed reports to monitor tower health. There was no centralized tool to see the health of ALL towers simultaneously on a map. CellNexus gives operators an **instant visual overview** — they can spot OFFLINE or DEGRADED towers at a glance from map colors.

**Problem 2 — No Geographical Context:**
Existing tools showed data in tables. An operator couldn't easily see *which region* had a problem. CellNexus overlays live telemetry directly on Google Maps — so an operator instantly knows a tower in Delhi is OFFLINE vs. one in Mumbai is DEGRADED.

**Problem 3 — No Self-Service Network Recommender:**
End users have no easy way to determine which mobile network (Jio/Airtel/Vi/BSNL) performs best at their current location. The Network Recommender uses the Haversine formula with real tower location data to score and recommend the best operator based on proximity and tower health.

---

## Q3. Why did you choose this project?

**Three reasons:**

1. **Real-world technical depth** — This is not a simple CRUD app. It combines WebSocket real-time architecture, custom algorithms (Haversine distance, geographic data slicing), SQL relational design, JWT authentication, and Google Maps API — all working together in one system.

2. **Full-stack coverage** — The project demonstrates every layer: UI/UX design, REST API design, SQL schema design, real-time push via Socket.io, JWT authentication, data simulation algorithms, and third-party API integration (Google Maps, Browser Geolocation). It lets me show a complete skill set.

3. **Domain relevance** — Telecom infrastructure monitoring is a real enterprise problem. Companies like Accenture work with telecom clients regularly. Building a system that mirrors what NOC (Network Operations Center) tools do gave practical, industry-relevant experience.

---

## Q4. What was your exact contribution?

I built **100% of this project solo**, from scratch. My contributions include:

| Area | What I Did |
|------|-----------|
| **System Design** | Designed the full architecture — REST + WebSocket, MySQL schema, React component tree |
| **Backend** | Built all Express routes, controllers, and middleware (auth + upload) |
| **Real-time Engine** | Built the Socket.io server with per-socket 3-second interval and telemetry emission |
| **Data Slicing Algorithm** | Designed and coded the Geographical Data Slicing algorithm to divide CSV rows among towers |
| **Database** | Designed the 3-table MySQL schema (Towers, Telemetries, Users) with FK constraints |
| **Frontend** | Built all 13 React components — maps, charts, admin panel, speed test, recommender |
| **Authentication** | Implemented JWT auth lifecycle with bcrypt, role-based middleware |
| **Maps Integration** | Integrated Google Maps API with custom OverlayView markers, coverage circles, dark theme |
| **Algorithms** | Implemented Haversine formula for Network Recommender, drop probability calculation |
| **Speed Test** | Built the 3-phase speed test (ping/download/upload) using Streams and `performance.now()` |

---

## Q5. Which technology stack did you use and why?

| Layer | Technology | Why |
|-------|-----------|-----|
| **Frontend** | React 19 + Vite 7 | Component-based UI, near-instant HMR with Vite, huge ecosystem |
| **Styling** | TailwindCSS 4 | Utility-first — rapid UI development without context-switching to CSS files |
| **Animations** | Framer Motion | Declarative enter/exit animations, smooth view transitions |
| **Maps** | Google Maps JS API | Industry standard, OverlayView for custom markers, rich circle and InfoWindow APIs |
| **Charts** | Recharts | D3-based, composable React chart library — perfect for area charts |
| **HTTP Client** | Axios | Cleaner than native fetch, automatic JSON parsing, easy auth header injection |
| **Real-time** | Socket.io | Abstracts WebSocket with fallback to long-polling, handles reconnects |
| **Backend** | Node.js + Express 5 | JavaScript everywhere, non-blocking I/O, rapid API development |
| **Database** | MySQL + mysql2 | Structured relational data, FK constraints, strong consistency |
| **Auth** | bcryptjs + JWT | One-way password hashing + stateless token-based authentication |
| **CSV Parsing** | csv-parser | Memory-efficient streaming CSV parser |
| **Deployment** | Local dev (Nodemon) + Cloud DB option (Aiven MySQL) | Zero-friction local development |

---

## Q6. Why did you choose this particular technology over alternatives?

**MySQL vs MongoDB:**
- Tower and telemetry data has a **clear relational structure** — towers have a foreign key to telemetries
- SQL gives **enforced referential integrity** — `Telemetries.towerId` can't point to a deleted tower without a constraint check
- Aggregation queries (`AVG(latency) GROUP BY towerId`) are natural SQL
- MongoDB would work, but a rigidly structured schema favors a relational database

**Socket.io vs Raw WebSocket / HTTP Polling:**
- Raw WebSocket requires manual reconnection handling, fallback logic for firewalls
- HTTP Polling: client sends a request every N seconds — wasteful, adds latency, not "push"
- Socket.io adds auto-reconnect, fallback to long-polling, rooms, namespaces — all out of the box

**Vite vs Create React App:**
- CRA uses Webpack — slow cold start (10-30s), slow HMR
- Vite uses native ES modules during dev — near-instant HMR (<100ms)
- Vite uses Rollup for production — better tree-shaking and smaller bundles

**JWT vs Sessions:**
- JWT is stateless — no server-side session storage needed
- Works perfectly for APIs — the client stores the token and sends it with every request
- Sessions require sticky sessions on load-balanced servers; JWT scales horizontally

**Raw SQL (mysql2) vs Sequelize ORM:**
- I actually removed Sequelize during development — it added abstraction overhead without clear benefit
- Raw SQL gives full control over queries — critical for performance-sensitive telemetry inserts
- `mysql2` prepared statements (`pool.execute('...WHERE id = ?', [id])`) prevent SQL injection without needing an ORM

---

## Q7. Explain the architecture of your project.

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
               │  mysql2/promise (connection pool, limit: 10)
               ▼
┌──────────────────────────────────────────┐
│         DATABASE (MySQL)                 │
│  Tables: Towers, Telemetries, Users      │
│  FK constraint: Telemetries → Towers     │
└──────────────────────────────────────────┘
```

**Key architectural principles:**
- **Decoupled Client-Server** — REST for CRUD, WebSocket for real-time push. Two separate channels.
- **Connection Pool** — `connectionLimit: 10` prevents MySQL from being overwhelmed by concurrent queries
- **CSV in Memory** — 900-row CSV loaded once at startup into `csvDataList[]` — no repeated disk I/O
- **`.env` for all secrets** — DB credentials, JWT secret, API keys never hardcoded

**React Component Tree:**
```
App.jsx  ← root state manager
├── RoleSelector.jsx      — Landing page with 3 role cards
├── AuthModal.jsx         — Login/Register modal with JWT
├── Header.jsx            — Filters, speed test trigger, nav
├── MetricsGrid.jsx       — 5 KPI cards
├── MapView.jsx           — Google Maps with custom markers
├── TowerList.jsx         — Scrollable filtered tower list
├── TowerDetail.jsx       — Tower info panel on click
├── CallStatsChart.jsx    — Live Recharts area chart
├── AdminPanel.jsx        — Full CRUD tower management
├── NetworkRecommenderModal.jsx  — Best operator calculator
├── DeveloperPanel.jsx    — Internal system view
└── SpeedTestModule.jsx   — Ping/Download/Upload tests
```

---

## Q8. Explain the complete flow of your application.

**Server Startup Flow:**
```
1. Node.js starts → dotenv loads .env variables
2. mysql2 pool created → connects to MySQL DB
3. csv-parser streams callstats_900.csv → 900 rows loaded into csvDataList[]
4. Express routes registered → app.listen(port)
5. Socket.io attached to HTTP server
```

**New Client Connection Flow:**
```
1. Browser opens app → React loads → useJsApiLoader fetches Google Maps SDK
2. useEffect fires → axios.get('/api/towers') → fetches all tower rows from MySQL
3. Towers rendered as custom OverlayView markers on Google Maps
4. socket.io-client connects → server receives 'connection' event
5. Server checks towerMappingInitialised flag:
   - If YES → start 3-second interval for this socket
   - If NO  → wait, then start interval after mapping is ready
```

**Real-time Data Loop (every 3 seconds):**
```
Server:
  1. For each tower → read next CSV row using tower's cursor
  2. Extract: incomingCalls, answeredCalls, responseTime
  3. Calculate: blockingProb, droppingProb
  4. INSERT INTO Telemetries (towerId, latency, callTotal, callAccepted)
  5. socket.emit('telemetry_update', updates[])

Client:
  6. socket.on('telemetry_update') → setTowers(prev → recalculate statuses)
  7. Only towers where status CHANGED trigger a re-render (optimization)
  8. Map marker color updates: green/amber/red
  9. Coverage circle radius shrinks for DEGRADED/OFFLINE
```

**Admin CRUD Flow:**
```
1. Admin clicks Login → POST /api/auth/login
2. Server: bcrypt.compare() → jwt.sign() → return { token }
3. React stores token in localStorage → sets Authorization header via Axios
4. Admin opens Admin Panel → GET /api/towers (with token)
5. Admin adds tower → POST /api/towers (verifyAdmin middleware checks JWT + role)
6. MySQL INSERT → returns new tower → React adds marker to map live
```

---

## Q9. What happens when a user sends a request to your application?

Let's trace a **protected admin request** (adding a new tower):

```
Step 1: Admin submits form in AdminPanel.jsx
        → axios.post('/api/towers', towerData, {
            headers: { Authorization: 'Bearer <token>' }
          })

Step 2: Express middleware chain runs:
        → express.json()     → parses request body
        → cors()             → validates origin
        → route matched      → POST /api/towers
        → verifyToken middleware:
             token = req.headers.authorization.split(' ')[1]
             decoded = jwt.verify(token, process.env.JWT_SECRET)
             req.user = { id, username, email, role }
             next()
        → verifyAdmin middleware:
             if (req.user.role !== 'admin') → 403 Forbidden
             next()

Step 3: Tower controller runs
        → pool.execute('INSERT INTO Towers (...) VALUES (?)', [fields])
        → Returns insertId

Step 4: Response sent
        → 201 Created + new tower object

Step 5: React receives response
        → setTowers(prev => [...prev, newTower])
        → New marker appears on map immediately
```

**For unauthenticated requests:**
- `jwt.verify()` throws → `401 Unauthorized` → React redirects to login

**For non-admin on admin route:**
- `verifyToken` passes → `verifyAdmin` checks `role !== 'admin'` → `403 Forbidden`

---

## Q10. What was the most difficult part of the project?

**The Geographical Data Slicing Algorithm — specifically the async initialization problem.**

The challenge: Real telecom telemetry data doesn't exist for a demo. I needed each of the 37 towers to show **different, realistic, continuously updating** data — not random noise (which makes charts jump erratically).

**My solution — Geographical Data Slicing:**
1. Load a real 900-row CSV into memory
2. Divide 900 rows equally across all towers — 30 towers → 30 rows each
3. Each tower gets its own `cursor` (`startIndex`, `endIndex`, `currentOffset`)
4. Every 3 seconds, each tower reads its **next sequential row** and loops back on overflow

**Why it was hard:**
- The CSV might not be fully parsed when the first Socket.io `connection` event fires (async timing issue)
- If I start emitting before the mapping is initialized, towers get wrong data or crash
- Solution: a `towerMappingInitialised` boolean flag — socket handlers wait for it before starting intervals

**The breakthrough:** Using the `'end'` event of the `csv-parser` stream to set `towerMappingInitialised = true` and then start any pending socket intervals — ensuring data is always ready before it's needed.

---

## Q11. What technical challenges did you face?

| Challenge | How I Solved It |
|-----------|----------------|
| **Async CSV + Socket.io race condition** | `towerMappingInitialised` flag — socket intervals start only after CSV is loaded |
| **Per-socket intervals not scaling** | Acknowledged as known limitation — fix is switching to `io.emit()` shared broadcast |
| **Foreign key DELETE constraint** | Delete `Telemetries` rows first, then `Towers` — manual cascade ordering |
| **Google Maps re-mount on every render** | Used `useCallback` for `onLoad` — memoizes function reference, prevents Map re-init |
| **Speed test unrealistic on localhost** | Speeds exceeded 120 Mbps on loopback — added realistic value clamping with random ranges |
| **Express 5 compatibility** | Removed `app.options('/*', cors())` — not supported in Express 5, replaced with `app.use(cors())` |
| **CORS wildcard in dev** | Used `origin: '*'` in dev — would whitelist specific domain in production |

---

## Q12. How did you debug those problems?

**My debugging process:**

1. **`console.log` at every critical step** — In the socket interval, I logged `tower.id`, `cursor.currentOffset`, and the extracted CSV values to verify data was flowing correctly per tower

2. **Postman for all API endpoints** — Tested every REST route with exact payloads before wiring up the frontend:
   - Tested `POST /api/auth/login` with wrong password → verified 401 response
   - Tested `DELETE /api/towers/:id` with and without auth token

3. **Browser DevTools — Network tab** — Inspected every HTTP request and Socket.io frame to see exact payloads, headers, and response times

4. **Browser DevTools — Console** — Socket.io connection events logged on client: `socket.on('connect')`, `socket.on('disconnect')` to verify connection lifecycle

5. **MySQL Workbench / direct queries** — After telemetry inserts, ran `SELECT * FROM Telemetries ORDER BY timestamp DESC LIMIT 10` to verify data was actually written

6. **Reading error messages carefully** — The FK constraint `ER_ROW_IS_REFERENCED_2` error on delete told me exactly to delete child rows first

7. **Git version control** — When a change broke real-time updates, reverted to last working commit and compared the diff to find the regression

---

## Q13. What was the biggest bug you encountered?

**The Async CSV Initialization Race Condition.**

**What happened:**
When a client connected to Socket.io immediately after the server started (before the CSV was fully streamed), the tower-data mapping (`csvDataList`, cursor objects) was `undefined` or empty. The interval would try to read `csvDataList[cursor.startIndex + cursor.currentOffset]` and get `undefined` — causing `Cannot read property of undefined` errors and crashing the telemetry loop for that socket.

**Root Cause:**
`csv-parser` is a **streaming** operation — it's asynchronous. The `'end'` event fires only after all 900 rows are processed. If a client connected in the 100-200ms window before `'end'` fired, the mapping wasn't ready yet.

**The Fix:**
```js
let towerMappingInitialised = false;

// In csv-parser 'end' callback:
towerMappingInitialised = true;
pendingSocketCallbacks.forEach(cb => cb()); // Start any waiting intervals
pendingSocketCallbacks = [];

// In socket 'connection' handler:
if (!towerMappingInitialised) {
    pendingSocketCallbacks.push(() => startTelemetryInterval(socket));
} else {
    startTelemetryInterval(socket);
}
```

By queuing pending socket callbacks and draining them when the CSV is ready, **no client ever tries to read uninitialized data**.

---

## Q14. How did you test your application?

**A combination of manual and API testing:**

**1. API Testing with Postman:**
- Tested every endpoint: register, login, GET/POST/PUT/DELETE towers, telemetry fetch
- Tested edge cases: wrong password, missing token, expired token, duplicate email, invalid tower ID
- Verified correct HTTP status codes (200, 201, 400, 401, 403, 404, 500)

**2. Database State Verification:**
- After every telemetry tick, queried MySQL directly: `SELECT * FROM Telemetries ORDER BY timestamp DESC LIMIT 5`
- Verified `towerId` FK, `latency`, `callTotal`, `callAccepted` values were correct

**3. Socket.io Testing:**
- Used browser DevTools Network tab → WS frames to inspect actual Socket.io events
- Verified `telemetry_update` event payload structure matched what the frontend expected

**4. Frontend Integration Testing:**
- Tested complete flows: open app → connect → see real-time map → click tower → see chart update → admin login → add tower → delete tower
- Tested Network Recommender with real GPS coordinates

**5. What I would add:**
- **Jest unit tests** for Haversine formula and drop probability calculation
- **Supertest** for Express API integration tests
- **React Testing Library** for component tests
- **k6 or Artillery** for load testing the Socket.io server

---

## Q15. How did you handle errors/exceptions?

**Backend — Every async route handler wrapped in try/catch:**
```js
const getTowers = async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM Towers');
        res.json(rows);
    } catch (error) {
        console.error('getTowers error:', error);
        res.status(500).json({ message: 'Failed to fetch towers' });
    }
};
```

**Key principles:**
- **Never expose raw error/stack trace to client** — generic message returned, full error logged on server
- **Meaningful HTTP status codes:** 400 (bad input), 401 (no/invalid token), 403 (wrong role), 404 (not found), 409 (duplicate), 500 (server error)
- **Early validation returns:** Missing required fields → return 400 immediately before hitting the DB

**Socket.io cleanup on disconnect:**
```js
socket.on('disconnect', () => {
    clearInterval(intervalId); // prevent memory leak
    console.log('Client disconnected:', socket.id);
});
```

**Frontend — Axios error handling:**
```js
try {
    const { data } = await axios.post('/api/auth/login', credentials);
    setCurrentUser(data.user);
    localStorage.setItem('token', data.token);
} catch (error) {
    const msg = error.response?.data?.message || 'Login failed';
    setError(msg);
}
```

**Speed test fallback:**
- If download/upload test throws, falls back to realistic clamped random values (45-95 Mbps download, 14-35 Mbps upload) — the UI never shows an error for this non-critical feature

---

## Q16. How did you make your application secure?

| Security Measure | Implementation |
|-----------------|---------------|
| **Password Hashing** | `bcrypt.genSalt(10)` + `bcrypt.hash()` — passwords never stored as plain text |
| **JWT Authentication** | Stateless tokens with 24h expiry — every protected route verified |
| **Role-Based Authorization** | `verifyToken` (authentication) + `verifyAdmin` (authorization) middleware chained |
| **No plain passwords returned** | User SELECT queries never return the password column |
| **Parameterized Queries** | `pool.execute('...WHERE id = ?', [id])` — prevents SQL injection on all queries |
| **JWT in Authorization header** | Not in cookies — avoids CSRF; protected by HTTPS in production |
| **CORS origin control** | Restricted in production; `origin: '*'` only in local dev |

**Known vulnerabilities I acknowledge:**
- No rate limiting on login endpoint (would add `express-rate-limit`)
- JWT stored in `localStorage` — XSS vulnerability; `httpOnly` cookies would be safer
- No input validation middleware (`Joi` or `Zod`) — malformed data could reach the DB
- `origin: '*'` in current CORS config — must be restricted in production
- No `Helmet.js` for HTTP security headers (X-XSS-Protection, Content-Security-Policy)

---

## Q17. How did you handle authentication/authorization?

**Authentication (Who are you?):**

```
Registration:
  POST /api/auth/register
  → Validate: email unique (UNIQUE constraint in DB)
  → bcrypt.hash(password, 10) → store hash in Users table
  → Return 201 Created

Login:
  POST /api/auth/login
  → SELECT user WHERE email = ?
  → bcrypt.compare(inputPassword, storedHash)
  → If match: jwt.sign({ id, username, email, role }, JWT_SECRET, { expiresIn: '24h' })
  → Return { token, user: { id, username, email, role } }
```

**JWT Flow on every protected request:**
```js
// verifyToken middleware
const token = req.headers.authorization?.split(' ')[1]; // "Bearer <token>"
if (!token) return res.status(401).json({ message: 'No token' });
const decoded = jwt.verify(token, process.env.JWT_SECRET);
req.user = decoded; // { id, username, email, role }
next();
```

**Authorization (What can you do?):**
```js
// verifyAdmin middleware — runs AFTER verifyToken
if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
}
next();
```

**Route protection in React:**
```jsx
// Checks localStorage for token + role before rendering admin panel
if (!currentUser || currentUser.role !== 'admin') {
    return <Navigate to="/" />;
}
```

**Frontend token storage:**
- JWT stored in `localStorage` → injected into every Axios request's `Authorization` header
- On logout: `localStorage.removeItem('token')` + `setCurrentUser(null)`

---

## Q18. How did you design your database?

**3 core tables with clear relationships:**

```sql
-- Towers: Core entity — cell tower metadata
CREATE TABLE Towers (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  radio           VARCHAR(255),        -- e.g., '4G', '5G'
  operatorName    VARCHAR(255),        -- e.g., 'Jio', 'Airtel'
  mcc             INT,                 -- Mobile Country Code (India = 404)
  mnc             INT,                 -- Mobile Network Code
  longitude       FLOAT,
  latitude        FLOAT,
  coverageRadius  INT DEFAULT 1000,    -- meters
  cid             INT,                 -- Cell ID
  locationName    VARCHAR(255),        -- e.g., 'Delhi'
  status          VARCHAR(255) DEFAULT 'GOOD'
);

-- Telemetries: Time-series data linked to towers (FK)
CREATE TABLE Telemetries (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  towerId      INT NOT NULL,           -- FK to Towers.id
  latency      INT,                    -- response time (ms)
  callTotal    INT,                    -- total incoming calls
  callAccepted INT,                    -- answered calls
  timestamp    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users: Authentication table
CREATE TABLE Users (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  username  VARCHAR(255),
  email     VARCHAR(255) UNIQUE,
  password  VARCHAR(255),             -- bcrypt hash
  role      ENUM('admin', 'viewer') DEFAULT 'viewer',
  createdAt TIMESTAMP
);
```

**Key design decisions:**

**FK Constraint on Telemetries:**
- `Telemetries.towerId` is a foreign key to `Towers.id`
- Ensures orphaned telemetry rows cannot exist
- On DELETE: must delete `Telemetries` rows first (manual cascade), then `Towers`

**`ENUM` for role:**
- `role ENUM('admin', 'viewer')` — MySQL enforces only these two values can be stored
- No need for a separate Roles table at this scale

**`UNIQUE` on email:**
- Database-level uniqueness guarantee — prevents duplicate accounts even if application-level check is bypassed

**`DEFAULT CURRENT_TIMESTAMP`:**
- Every telemetry row automatically timestamped when inserted — no application code needed

---

## Q19. Why did you choose SQL (MySQL) over NoSQL (MongoDB)?

**I chose MySQL (SQL) for these reasons:**

**1. Clear relational structure:**
Towers and Telemetries have a strict parent-child relationship with a foreign key. This is exactly what SQL was designed for.

**2. Referential integrity:**
A `Telemetry` row must always point to an existing `Tower`. SQL's FK constraint enforces this at the database level — impossible to have orphaned telemetry data.

**3. Strong consistency:**
Telecom monitoring data must be consistent. SQL's ACID transactions guarantee that every telemetry insert either fully succeeds or fully fails — no partial writes.

**4. Aggregation queries:**
Queries like `SELECT AVG(latency), towerId FROM Telemetries GROUP BY towerId` are natural, performant SQL. In MongoDB, this requires an aggregation pipeline.

**5. Structured, fixed schema:**
Tower data fields are known and fixed (radio, operator, MCC, MNC, lat/long). MongoDB's schema flexibility wasn't needed here.

**Trade-offs I acknowledge:**

| MySQL Weakness | Better NoSQL Solution |
|---------------|----------------------|
| Schema migrations needed for new fields | MongoDB — add fields with zero migration |
| Less natural for nested/array data | MongoDB — arrays embed naturally |
| Scaling horizontally is harder | Cassandra/DynamoDB — distributed by design |

> **Honest answer:** For this specific project — structured telemetry with FK relationships — MySQL was the correct and deliberate choice over MongoDB.

---

## Q20. What happens if your number of users increases 100x?

**Current bottlenecks and what breaks first:**

| Bottleneck | Why it breaks at scale |
|-----------|----------------------|
| **Per-socket intervals** | 100 clients = 100 separate `setInterval` = 100 DB queries every 3s = ~33 queries/sec on ONE table |
| **No read replicas** | All dashboard reads and telemetry writes hit the same MySQL instance |
| **No caching** | `GET /api/towers` hits DB on every page load — even though towers change rarely |
| **No pagination** | Admin panel loads ALL tower rows + ALL telemetry rows into memory |
| **Connection pool limit** | Pool `connectionLimit: 10` would bottleneck under high concurrency |
| **Socket.io single server** | No Redis adapter — cannot scale horizontally to multiple Node.js instances |

**What a user would experience:**
- Map loads slowly (DB overwhelmed with telemetry inserts)
- Socket updates stall (interval queued, waiting for DB connection from pool)
- Admin panel crashes (loading 10,000 tower rows in one query)

---

## Q21. How would you scale this project?

**Step-by-step scaling plan:**

**Step 1 — Fix the per-socket interval problem (highest priority):**
```js
// Replace: socket.emit() per socket
// With: one shared global interval → broadcast to ALL clients
const globalInterval = setInterval(async () => {
    const updates = await calculateAllTowerUpdates();
    io.emit('telemetry_update', updates); // one broadcast, all clients
}, 3000);
```
This reduces DB queries from `N * 1/3s` to a constant `1/3s` regardless of client count.

**Step 2 — Redis Pub/Sub for multi-server Socket.io:**
```
Node Server 1 ──┐
Node Server 2 ──┼──→ Redis Pub/Sub ──→ Socket.io adapter
Node Server 3 ──┘
```
Allows horizontal scaling — any server can emit to any client.

**Step 3 — MySQL read replicas:**
- All `SELECT` queries (dashboard, tower list) → hit replica
- Only `INSERT` (telemetry writes) → hit primary
- Dramatically reduces load on primary DB

**Step 4 — Caching with Redis:**
```js
// Cache GET /api/towers (towers rarely change)
const cached = await redis.get('all_towers');
if (cached) return res.json(JSON.parse(cached));
// Invalidate cache on POST/PUT/DELETE tower
```

**Step 5 — Pagination on admin tables:**
```sql
SELECT * FROM Towers LIMIT 50 OFFSET 0;  -- page 1
SELECT * FROM Towers LIMIT 50 OFFSET 50; -- page 2
```

**Step 6 — Message queue for telemetry ingestion:**
- Replace direct DB inserts in Socket.io interval with Kafka/RabbitMQ messages
- Separate consumer service handles DB writes asynchronously
- Socket.io only emits — doesn't wait for DB

---

## Q22. What are the limitations of your project?

| Limitation | Impact |
|-----------|--------|
| **Per-socket intervals** | Doesn't scale — each client creates its own DB query loop |
| **No rate limiting** | Login endpoint vulnerable to brute-force attacks |
| **JWT in localStorage** | Vulnerable to XSS attacks — httpOnly cookies would be safer |
| **No input validation** | Missing Joi/Zod — malformed data can reach DB |
| **No role auth on PUT/DELETE** | Currently no `verifyAdmin` on tower update/delete routes — any logged-in user can edit |
| **Speed test on localhost** | Values require artificial clamping — not real-world accurate |
| **No real-time push to admin** | Admin must refresh page to see new towers added by other admins |
| **CSV data is simulated** | Not real telecom data — pattern repeats every ~30 rows per tower |
| **No pagination** | All towers and telemetry loaded at once — slow with 1000+ towers |
| **No WebSocket auth** | Socket.io connection is unauthenticated — any client can receive telemetry events |

---

## Q23. What would you improve if you had another month?

**Priority order:**

1. **Shared global broadcast** — Replace per-socket `setInterval` with one global interval using `io.emit()`. This is the single biggest scalability improvement — drops DB queries from `100N` to `1` constant.

2. **WebSocket authentication** — Add JWT verification on Socket.io `connection` event:
   ```js
   io.use((socket, next) => {
       const token = socket.handshake.auth.token;
       jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
           if (err) return next(new Error('Unauthorized'));
           socket.user = decoded;
           next();
       });
   });
   ```

3. **Admin route auth** — Add `verifyAdmin` middleware to `PUT /api/towers/:id` and `DELETE /api/towers/:id` — currently these are missing role protection.

4. **`express-rate-limit`** — Max 5 login attempts per 15 minutes per IP on `/api/auth/login`.

5. **Pagination** — Add `LIMIT/OFFSET` on admin tower and telemetry tables.

6. **Jest unit tests** — Full test suite for Haversine formula, drop probability calculation, and CSV cursor slicing algorithm.

7. **Historical analytics** — Date range picker for viewing tower telemetry trends over days/weeks, not just last 20 records.

8. **Notification system** — Email/SMS alert when a tower's status changes to OFFLINE — using Nodemailer or Twilio.

---

## Q24. If you had to rebuild it, what would you do differently?

**5 key changes:**

**1. Global shared Socket.io broadcast from day one:**
The per-socket `setInterval` architecture was a design mistake for scalability. I'd architect from day one with one global interval and `io.emit()`.

**2. TypeScript throughout:**
The Haversine formula and drop probability calculations involve precise math. TypeScript would catch type errors (e.g., `string` where `number` expected) at compile time, preventing silent calculation bugs.

**3. Proper Socket.io authentication middleware from day one:**
Unauthenticated WebSocket connections are a security gap. I'd add JWT verification on the Socket.io handshake immediately rather than retrofitting it later.

**4. Docker Compose for local development:**
The current setup requires manually starting MySQL, creating the database, running seed scripts, then starting the server. A `docker-compose.yml` would bring everything up with one command:
```yaml
services:
  db:
    image: mysql:8.0
  server:
    image: node:20
  client:
    image: node:20
```

**5. Environment-aware URLs from day one:**
Any URLs that reference the frontend (CORS origins, redirect URLs) should come from `process.env.CLIENT_URL`, not hardcoded strings.

**What I'd keep the same:**
- React + Node.js architecture — clean and effective
- MySQL for this use case — right tool for structured time-series telemetry
- Socket.io — excellent abstraction over raw WebSocket
- Geographical Data Slicing algorithm — elegant and scalable CSV simulation approach
- Google Maps OverlayView for custom markers — gives full CSS control vs default pins

---

## Q25. Can you explain one feature of your project in detail?

**The Geographical Data Slicing Algorithm — the most unique and technically interesting feature.**

**The Problem:**
A real telecom dashboard needs live, per-tower telemetry. But for a demo project, real telemetry from real towers doesn't exist. If I used `Math.random()` for each tower every 3 seconds, the charts would look like noise — spiky, unrealistic, and different every render.

**My Solution — 4 steps:**

**Step 1 — Load real historical data:**
```js
const csvDataList = [];
fs.createReadStream('callstats_900.csv')
  .pipe(csv())
  .on('data', (row) => csvDataList.push(row))
  .on('end', () => {
      towerMappingInitialised = true;
      initializeTowerCursors();
  });
```

**Step 2 — Divide rows among towers (slicing):**
```js
function initializeTowerCursors() {
    const rowsPerTower = Math.floor(csvDataList.length / towers.length);
    // e.g., 900 rows / 30 towers = 30 rows per tower

    towers.forEach((tower, index) => {
        towerCursors[tower.id] = {
            startIndex: index * rowsPerTower,
            endIndex: (index + 1) * rowsPerTower - 1,
            currentOffset: 0
        };
    });
}
```

**Step 3 — Each tower reads its next row every tick:**
```js
function getNextRowForTower(towerId) {
    const cursor = towerCursors[towerId];
    const absoluteIndex = cursor.startIndex + cursor.currentOffset;
    const row = csvDataList[absoluteIndex];

    // Advance cursor, loop back at end of slice
    cursor.currentOffset =
        (cursor.currentOffset + 1) % (cursor.endIndex - cursor.startIndex + 1);
    return row;
}
```

**Step 4 — Calculate status from the row:**
```js
const row = getNextRowForTower(tower.id);
const incomingCalls = parseInt(row['Incoming Calls']);
const answeredCalls = parseInt(row['Answered Calls']);
const droppingProb = calculateDropProbability(incomingCalls, answeredCalls);

const status = droppingProb > 0.10 ? 'OFFLINE'
             : droppingProb > 0.07 ? 'DEGRADED'
             : 'GOOD';
```

**Why this is elegant:**
- Each tower consumes a **different, independent** slice of real historical data
- Charts show smooth, realistic variation — not random noise — because data comes from real patterns
- The cursor loops seamlessly — no gaps, no stalls, infinite streaming
- Scales automatically — 60 towers = 15 rows each; 10 towers = 90 rows each
- A `tower_data_mapping.txt` file is generated for academic verification — proving exactly which rows went to which tower

**Concrete result:**
```
Tower 1 (Jio, Delhi):    uses CSV rows  0–29  in a loop
Tower 2 (Airtel, Mumbai): uses CSV rows 30–59  in a loop
Tower 3 (Vi, Pune):       uses CSV rows 60–89  in a loop
```
Every tower looks different. Every chart is smooth. The map feels alive.

---

## 📌 Quick Reference — Key Numbers to Memorize

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
| OFFLINE threshold | Drop probability **> 10%** |
| DEGRADED threshold | Drop probability **> 7%** |
| DEGRADED coverage radius | **60%** of normal |
| OFFLINE coverage radius | **15%** of normal |
| Handoff call % of total | **30%** |
| Earth radius (Haversine) | **6371 km** |
| India MCC | **404** |

---

## 📌 One-Line Summary Table

| Question | One-Line Answer |
|----------|----------------|
| What is the project? | Full-stack real-time cellular network monitoring dashboard |
| Tech stack? | React 19 + Vite + Node.js + Express 5 + MySQL + Socket.io + Google Maps |
| Hardest part? | Async CSV initialization race condition + Geographical Data Slicing algorithm |
| Biggest bug? | CSV not ready when first Socket.io client connected — fixed with `towerMappingInitialised` flag |
| Why MySQL? | Structured relational data with FK constraints — towers to telemetries |
| Why JWT? | Stateless, scales horizontally, no server-side session storage |
| How to scale? | Global `io.emit()` + Redis Pub/Sub + MySQL read replicas + Redis caching |
| Biggest limitation? | Per-socket intervals, no Socket.io auth, no rate limiting |
| What to rebuild differently? | TypeScript, shared global broadcast, Docker Compose, WebSocket auth from day one |
| Most unique feature? | Geographical Data Slicing — divides 900-row CSV into per-tower slices for realistic simulation |

---

*Good luck in your Accenture interview! You built a real-time distributed system — not a simple CRUD app. Own every decision confidently. 🚀*
