const fs = require('fs');
const path = require('path');

const fileOut = path.join(__dirname, 'Project_Report.md');

let content = `# Project Report: Cellular Network Dashboard

## 1. Problem Statement
Modern cellular network infrastructures are vast and highly complex. When a network issue occurs, such as high call drops, latency spikes, or failing towers, network operators and analysts often struggle to visualize the problem geographically in real-time. Without a centralized, interactive dashboard, telecom teams rely on fragmented raw data (CSV logs) and delayed reports, resulting in slower response times to cellular degradation and a poor experience for end-users.

## 2. Proposed Solution
The **Cellular Network Dashboard** was developed as a full-stack, real-time monitoring system. It provides a geographical interface (a map) where network analysts can actively monitor the health of cell towers across different regions. When a tower experiences high traffic or call failures, the dashboard instantly reflects these changes through visual indicators (colors, coverage radii) and live charts, allowing for immediate diagnosis and resolution.

## 3. How It Was Made (Technology Stack & Architecture)
The project follows a standard decoupled Client-Server architecture.

* **Frontend (User Interface):** Built with **React.js** and styled using **Tailwind CSS**. It uses **Leaflet.js** (\`react-leaflet\`) for rendering the interactive geographical map and **Recharts** to plot live telemetry graphs.
* **Backend (Server & Simulation):** Built using **Node.js** and **Express.js**. It features a **Socket.io** integration that establishes a persistent WebSocket connection with the frontend, pushing fresh telemetry data every 3 seconds to simulate live network traffic.
* **Database:** **MySQL** is used to store tower metadata, locations, and historical telemetry data.

## 4. Data Sourcing and Mechanics
Data simulation drives the dashboard, ensuring realistic visualization without needing a physical connection to an actual telecom ISP layout.
* **Raw Historical Data:** The database is initially populated using an administrative script (\`seed.js\`), which reads massive telecom logs from a local \`CallStats.csv\` file and batch-inserts historical records into the MySQL database.
* **Live Telemetry Engine:** An additional dataset (\`callstats_900.csv\`) is piped into the Node.js server. A custom "Geographical Data Slicing" algorithm maps chunks of this CSV row-data to specific towers. The server mathematically calculates answering, blocking, and dropping probabilities, and then broadcasts these via WebSocket to the frontend every 3 seconds.

## 5. Benefits to Stakeholders

### How This Helps the **User** (Network Analyst / Engineer)
1. **Real-time Visualization:** Analysts no longer need to parse spreadsheets. They simply look at the map; if a tower icon is red, they know there's an outage.
2. **Predictive Monitoring:** By viewing the live area charts for "Answered vs Blocked" calls, analysts can see traffic spikes while they are happening.
3. **Geographical Context:** Seeing exactly where a tower is helps operators dispatch physical repair crews faster.

### How This Helps the **Admin** (System Maintainer)
1. **Database Simplicity:** The Admin can wipe and repopulate the entire simulated history across thousands of rows instantly by running the \`seed.js\` script.
2. **Scalability:** The backend script automatically adjusts the data slicing depending on how many towers are entered in the database; it dynamically adapts without hardcoding.

## 6. System Thresholds
To make the dashboard readable at a glance, several critical visual thresholds have been implemented programmatically:

1. **Tower Status Colors (Based on Database State):**
   * <span style="color:#10B981">**GOOD** (Emerald Green)</span>
   * <span style="color:#F59E0B">**DEGRADED** (Amber/Orange)</span>
   * <span style="color:#EF4444">**OFFLINE** (Red)</span>

2. **Geographical Coverage Radius mapping:**
   * If \`GOOD\`: Radius = 100% of defined coverage size.
   * If \`DEGRADED\`: Radius conditionally shrinks to 60%.
   * If \`OFFLINE\`: Radius conditionally shrinks to 15%.

3. **Critical Call Drop Limit (\`CallStatsChart.jsx\`):**
   * If the Drop Probability (Failed Handoffs vs Total Incoming) exceeds **10%**, the system triggers a **Red Alert Pulse**, flashing the KPI box red to indicate a critical service failure.

---

## 7. System Flowcharts

### 7.1 User Flow Diagram
_Shows the interaction path of a network analyst using the frontend application._

\`\`\`mermaid
graph TD
    A([User Opens Dashboard URL]) --> B[View Main India Map Interface]
    B --> C{Are Towers Visible on Map?}
    C -->|Yes| D[Click on Specific Cell Tower Marker]
    C -->|No| E[Pan or Zoom Map] --> B
    
    D --> F[View Tower Detail Popup & Panel]
    F --> G[View Call Status Area Charts]
    G --> H[Observe Real-Time Probability Updates]
    H --> I([Continue Monitoring])
\`\`\`

### 7.2 Administrator / System Flow Diagram
_Shows the backend initialization and live simulation cycle._

\`\`\`mermaid
graph TD
    A([Admin Prepares System]) --> B{Is Database Empty?}
    
    B -->|Yes| C[Run seed.js Script]
    C --> D[Mass Insert CallStats.csv History to MySQL]
    D --> E[Run server.js]
    
    B -->|No| E[Run server.js]
    
    E --> F[Express Server & Socket.io Start]
    F --> G[Read callstats_900.csv into Memory]
    G --> H[System calculates Random Data every 3sec]
    H --> I[Insert Live Telemetry to DB]
    I --> J[Broadcast Socket Updates to React UI]
\`\`\`

---

## 8. Annexures

### Annexure A: System Architecture Diagram

\`\`\`mermaid
graph TD
    subgraph Data Sources
        RAW[CallStats.csv] -.-> SEED(seed.js script)
        LIVE[callstats_900.csv] -.-> SERVER(server.js)
    end
    
    subgraph Backend
        SEED -- Mass Inserts --> DB[(MySQL DB)]
        SERVER -- Queries & Feeds --> DB
        SERVER -- WebSocket Update --> FRONT
    end

    subgraph Frontend User Interface
        FRONT(App.jsx) --> MAP(MapView.jsx)
        FRONT --> CHARTS(CallStatsChart.jsx)
    end
\`\`\`

### Annexure B: Core Source Code

`;

content += "**File: server.js (Backend)**\n```javascript\n" + fs.readFileSync(path.join(__dirname, 'backend/server.js'), 'utf8') + "\n```\n\n";
content += "**File: seed.js (Backend)**\n```javascript\n" + fs.readFileSync(path.join(__dirname, 'backend/seed.js'), 'utf8') + "\n```\n\n";
content += "**File: App.jsx (Frontend)**\n```javascript\n" + fs.readFileSync(path.join(__dirname, 'frontend/src/App.jsx'), 'utf8') + "\n```\n\n";

fs.writeFileSync(fileOut, content);
console.log('Done creating Project_Report.md!');
