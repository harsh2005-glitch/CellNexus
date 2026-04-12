# 📡 CellNexus: Network Intelligence Dashboard

![CellNexus Dashboard](https://raw.githubusercontent.com/shadcn/ui/main/apps/www/public/og.jpg)

**CellNexus** is a real-time, high-performance Telecommunications Network Operations Center (NOC) dashboard designed to simulate and visualize live cellular tower telemetry at scale. Built for academic/engineering research, it ingests hundreds of rows of raw Baseband Unit (BBU) traffic data, processes advanced handoff mathematics dynamically, and streams live visualizations of network degradation constraints directly to the browser.

## ✨ Core Features

### 🌐 Live Geographical Map 
* Features 30 distinct cell towers plotted across India using `React-Leaflet`.
* **Dynamic RF Coverage Radius:** Tower signal radii natively expand and collapse (from 100% down to 15% range) in real-time based on live mathematical packet-dropping vulnerabilities.

### 📊 Advanced Telecommunication Mathematics
Calculates advanced internal BBU KPIs natively from standard call CSV structures every 3 seconds:
* Splits standard "Answered Calls" into distinct **Answered (New)** and **Answered (Handoff)** streams (assumed 30% movement ratio).
* Categorizes failures cleanly into specific pipeline traps: **Call Blocking Probability** (Registration Rejection) vs. **Call Dropping Probability** (Active Handoff Failure). 
* Includes a dynamic Threshold UI engine (Safe <= 7%, Degraded > 7%, Offline > 10%).

### ⚙️ Dedicated Geolocation Data Slicing Engine
To prove distinct operational environments without needing 30 individual datasets, the backend algorithmically chunks large (`900+ row`) telemetry datasets into strict array boundaries perfectly indexed to single Geographical Towers. This ensures Delhi traffic and Mumbai traffic NEVER broadcast identical randomized signatures simultaneously. 

### ⚡ Raw Performance & Stack
* **Frontend:** React + Vite, TailwindCSS (Glassmorphism), Recharts (Live Stacked Area series), socket.io-client.
* **Backend:** Node.js, Express, Socket.io (Broadcaster).
* **Database:** Hosted Aiven MySQL Database running on purely **Raw SQL queries** (`mysql2/promise` with pooling) to bypass heavy ORMs and maximize query speeds.

---

## 🚀 Getting Started

### 1. Prerequisites
* [Node.js](https://nodejs.org/) (v16 or higher)
* An active [Aiven MySQL](https://aiven.io/) cloud database (or any local MySQL instance).

### 2. Installation

Clone the repository and install dependencies for both the frontend and backend:
```bash
git clone https://github.com/yourusername/CellNexus.git
cd CellNexus

# Install backend
cd backend
npm install

# Install frontend
cd ../frontend
npm install
```

### 3. Database Configuration
Create a `.env` file inside the `backend/` directory, and paste in your MySQL credentials:
```env
# backend/.env
DB_HOST=your-aiven-host.aivencloud.com
DB_PORT=25785
DB_USER=avnadmin
DB_PASSWORD=your_password
DB_NAME=defaultdb
PORT=5000
```
*(Make sure to Whitelist your IP in the Aiven Firewall Console if you encounter `ETIMEDOUT` errors!)*

### 4. Running the Project

**Start the Backend (Terminal 1):**
```bash
cd backend
node seed.js  # Run this ONCE to initialize the tables and 30 Towers
node server.js
```
*(When started, `server.js` will automatically generate a `tower_data_mapping.txt` file displaying how it sliced the CSV file into geographical buckets!)*

**Start the Frontend (Terminal 2):**
```bash
cd frontend
npm run dev
```

Navigate to `http://localhost:5173` in your browser.

---

## 📂 Project Architecture

```text
├── backend/
│   ├── config/
│   │   └── db.js            # Raw mysql2 Connection Pool
│   ├── routes/
│   │   └── towers.js        # SQL Tower APIs
│   ├── .env
│   ├── callstats_900.csv    # Live Telemetry Simulation Dataset
│   ├── server.js            # Express Sever & WebSockets Broadcaster
│   └── seed.js              # Initial Tower Registration Script
│
└── frontend/
    └── src/
        ├── components/
        │   ├── MapView.jsx        # Dynamic Heatmaps and Geolocation
        │   ├── CallStatsChart.jsx # Real-time Handoff Mathematical Analytics
        │   ├── Header.jsx         # UI Filtering & Layout Setup
        │   └── MetricsGrid.jsx    # General Telemetry KPIs
        └── App.jsx
```

## 🤝 Contribution and Credits
Built to demonstrate modern MERN + SQL real-time tracking pipelines. Feel free to fork, expand the telemetry simulator structure, or inject artificial weather outages into the Socket emitter!
