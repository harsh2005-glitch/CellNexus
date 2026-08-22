# Project Presentation Content

Here is a slide-by-slide breakdown that you can copy and paste directly into PowerPoint, Google Slides, or Canva. 

---

## Slide 1: Title Slide
* **Title:** CellNexus: Real-Time Network Intelligence Dashboard
* *(Alternative Names you can use: NetPulse NOC, TowerLink Analytics, SignalScope, AeroNet Tracker)*
* **Subtitle:** Simulating and Visualizing Live Cellular Tower Telemetry at Scale
* **Presenter:** Harshit Maurya
* **Date:** [Insert Date]

---

## Slide 2: Introduction & Problem Statement
* **Heading:** The Challenge in Telecommunications
* **Bullet Points:**
  * Modern cellular networks handle millions of connections per minute.
  * Real-time monitoring of tower health, packet drops, and active handoffs is crucial but difficult to visualize.
  * Identifying network blockages and coverage degradation instantly can prevent major network outages and call drops.
* **Speaker Notes:** "Telecom administrators need a way to not just read raw data, but physically see which geographical areas are experiencing poor connectivity in real-time."

---

## Slide 3: Project Objective
* **Heading:** Core Objectives
* **Bullet Points:**
  * **Real-Time Monitoring:** To build a highly responsive network operations center (NOC) dashboard that tracks live cellular tower telemetry without UI latency.
  * **Accurate Fault Localization:** To provide immediate geographical visualization of network health to instantly pinpoint degradation and handoff failures.
  * **Algorithmic Simulation:** To develop an intelligent data-slicing engine that simulates massive, concurrent baseband unit (BBU) traffic streams accurately.
  * **Performance Optimization:** To demonstrate how modern web technologies (WebSockets) combined with raw SQL queries bypass the overhead of heavy ORMs for real-time data delivery.

---

## Slide 4: What is CellNexus?
* **Heading:** Introducing CellNexus
* **Bullet Points:**
  * A real-time Telecommunications Network Operations Center (NOC) dashboard.
  * Ingests and processes raw Baseband Unit (BBU) traffic data dynamically.
  * Broadcasts live network degradation metrics directly to a web browser.
  * Plots geographical cell tower variations in real-time for immediate troubleshooting.

---

## Slide 5: Core Feature 1 - Live Geographical Mapping
* **Heading:** Dynamic Map & RF Coverage
* **Bullet Points:**
  * **30 Distinct Towers:** Geographically plotted across major zones (e.g., Delhi, Mumbai) using React-Leaflet.
  * **Dynamic RF Signals:** Tower signal coverage expands and collapses natively (down to 15% radius) based on live mathematical packet-dropping constraints.
  * **Visual Identification:** Instantly see which region is "Safe", "Degraded", or "Offline".

---

## Slide 6: Core Feature 2 - Advanced Telecomm Mathematics
* **Heading:** Processing Real-Time Analytics
* **Bullet Points:**
  * Analyzes standard call CSV structures every 3 seconds.
  * Computes complex KPIs:
    * **Call Blocking Probability:** Fails at registration.
    * **Call Dropping Probability:** Active handoff failures.
  * Differentiates "New Calls" from "Handoff Calls" to accurately simulate moving users.

---

## Slide 7: Core Feature 3 - Data Slicing Engine
* **Heading:** Intelligent Geolocation Data Slicing
* **Bullet Points:**
  * Bypasses the need for 30 individual datasets.
  * Algorithmically chunks a massive (900+ row) telemetry dataset into strict boundaries bound to specific towers.
  * Ensures that different towers (e.g., in Delhi vs. Mumbai) never broadcast identical patterns simultaneously natively simulating natural chaos.

---

## Slide 8: Tech Stack & Architecture
* **Heading:** Built for Raw Performance
* **Frontend:** React + Vite, TailwindCSS (for sleek UI), Recharts (live data streaming), React-Leaflet.
* **Backend:** Node.js, Express, Socket.io (for real-time broadcasting to the frontend).
* **Database:** Aiven MySQL Database running purely on *Raw SQL queries* for maximum efficiency—bypassing heavy ORMs.

---

## Slide 9: Live Demonstration
* **Heading:** Live Dashboard Preview
* **Content:** *(Add 1 or 2 screenshots of your working dashboard here, especially the map and the changing line charts!)*
* **Speaker Notes:** "During this demo, you will see how the charts react to the socket connection in real-time and how the coverage circles on the map shrink when a tower undergoes stress."

---

## Slide 10: Future Scope & Enhancements
* **Heading:** What's Next for CellNexus?
* **Bullet Points:**
  * **Weather Outage Injection:** Simulating how rain and storms artificially degrade signals.
  * **Machine Learning:** Using anomaly detection to foretell which towers are likely to drop next.
  * **Expanded Regions:** Scaling from 30 towers to thousands across multiple countries.

---

## Slide 11: Conclusion & Q&A
* **Heading:** Thank You!
* **Bullet Points:**
  * CellNexus proves that robust real-time tracking pipelines can be built beautifully using the MERN stack and SQL.
  * Any Questions?
