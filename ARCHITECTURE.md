# Enterprise Data Visualizer - Architecture & Style Guide 🎓

**Welcome!** This guide is designed to explain the "What", "Why", and "How" of the Enterprise Data Visualizer (EDV) project. Whether you are a beginner or revisiting this code later, this document will help you understand every architectural decision.

---

## 🏗️ High-Level Architecture

The system is composed of **3 Main Applications** and **1 Database**.

```mermaid
graph TD
    User((User)) -->|Visits| ReactApp[Main React App<br>(Frontend)]
    
    ReactApp -->|Queries Data| AssetService[Asset Service<br>(Backend API)]
    ReactApp -->|Embeds| DashApp[Dash App<br>(Visualization Engine)]
    
    AssetService -->|Reads/Writes| DB[(Supabase<br>PostgreSQL)]
    DashApp -->|Reads| DB
    
    subgraph Cloud
        DB
    end
    
    subgraph Vercel
        ReactApp
    end
    
    subgraph Render
        AssetService
        DashApp
    end
```

---

## 1. 🖥️ Main React App (Frontend)
**Location:** `/main-react-app`
**Deployed to:** Vercel

### What is it?
The "face" of the application. It provides the layout, navigation, asset browsing sidebar, and global state management.

### Tech Stack & Choices
*   **Vite**: The build tool. *Why?* It's lightning fast compared to Create React App (CRA).
*   **React 19**: The UI library.
*   **TypeScript**: Adds types (string, number, Signal) to JavaScript. *Why?* Prevents 90% of bugs (like trying to access `.name` on `undefined`) before you even run the code.
*   **Zustand**: State Management. *Why?* Redux is too complex/boilerplate-heavy. Context API causes too many re-renders. Zustand is simple, fast, and hooks-based.
*   **Tailwind CSS**: Styling. *Why?* Faster than writing separate `.css` files. "Utility-first" approach keeps styles consistent.
*   **Apollo Client**: Data Fetching. *Why?* We use **GraphQL**. Apollo handles caching, loading states, and error handling automatically.

### Key Files
*   `src/components/Sidebar.tsx`: The heart of navigation. Uses a **Recursive Component** strategy to render the infinite tree of Site -> Plant -> Unit.
*   `src/store.ts`: The "Brain". Stores what signals are selected, if we are in "Live Mode", and global settings.

---

## 2. ⚙️ Asset Service (Backend API)
**Location:** `/asset-service`
**Deployed to:** Render

### What is it?
The "gateway" to our data. It uses **GraphQL** to serve data to the frontend.

### Tech Stack & Choices
*   **Node.js**: The runtime.
*   **Apollo Server**: The GraphQL server.
*   **GraphQL**: The API Language. *Why?* Instead of 10 endpoints (`/get-sites`, `/get-plants`, etc.), we have ONE endpoint. The frontend asks for exactly what it wants (e.g., "Give me Site names and their types"), and the backend returns exactly that. No over-fetching.
*   **Supabase Client (`@supabase/supabase-js`)**: To talk to the database.

### Key Features
1.  **Resolvers (`index.js`)**: Functions that tell the server *how* to get data. When the frontend asks for `assets`, the resolver runs a SQL query `supabase.from('assets').select('*')`.
2.  **Live Ingestion (`live_ingest.js`)**: A background script that runs automatically. It pushes fake sensor data to the DB every 2 seconds so the charts look alive.

---

## 3. 📈 Main Dash App (Visualization)
**Location:** `/main-dash-app`
**Deployed to:** Render

### What is it?
A specialized Python application strictly for **Heavy Data Visualization**.

### Tech Stack & Choices
*   **Python**: The best language for data science.
*   **Dash (by Plotly)**: A framework for building analytical web apps. *Why?* React charting libraries (Recharts, Chart.js) struggle with millions of data points. Plotly is built for scientific performance (WebGL).
*   **Pandas**: For data manipulation.

### How it works
The React App renders an `<iframe>` pointing to this Dash App. React sends the Signal IDs via URL parameters (`?signal_id=sig-1,sig-2`). Dash reads these params, queries the DB, and renders the high-performance chart.

---

## 4. 🗄️ Database (Supabase)
**Type:** PostgreSQL (Hosted)

### Why Supabase?
It gives us a real **PostgreSQL** database (the industry standard) but with a beautiful UI (Dashboard) and an easy API/SDK. It also has a generous **Free Tier**.

### Schema
*   `assets`: Stores the hierarchy (Site, Plant, Signal). Uses `jsonb` layout for flexibility.
*   `snapshots`: Saved Views (Bookmarks).
*   `measurements`: The massive table storing sensor readings (`timestamp`, `value`, `signal_id`).

### The "Smart Slice" Retention Policy
We generate data every **2 seconds** (High Frequency).
*   **Problem:** 2 seconds * 24 hours = ~43,000 rows/day per signal. This would fill our generic database quickly.
*   **Solution:** We use a SQL Cleanup Function that deletes data older than 24 hours **UNLESS** it falls exactly on the hour (`XX:00:00`).
*   **Result:** We keep "Live" data for today, and "Hourly History" forever.

---

## 🚀 Deployment Guide

### Why these platforms?
*   **Vercel (Frontend)**: Optimized for Next.js/React. Easiest setup in the world (Git Push -> Deploy).
*   **Render (Backend/Python)**: Great for Docker/Node/Python services that need to run continuously (unlike Vercel Serverless functions which shut down immediately).

### Environment Variables
For the apps to talk to each other, they share "Secrets":
1.  **React App**: Needs `VITE_GRAPHQL_ENDPOINT` (Where is the backend?) and `VITE_DASH_URL` (Where is the chart?).
2.  **Asset Service**: Needs `SUPABASE_URL` and `KEY` (To read DB).
3.  **Dash App**: Needs `SUPABASE_URL` and `KEY` (To read DB).

---

## 🎓 Summary for Revision

If you are explaining this project to an interviewer:
> "I built a full-stack Enterprise Data Visualizer. It uses a **React 19** frontend with **TypeScript** and **Zustand** for a robust UI. The backend is a **Node.js GraphQL** service that serves hierarchical asset data. For high-performance charting, I integrated a **Python Dash** micro-frontend via iframes. Data is persisted in **Supabase (PostgreSQL)**, where I implemented a custom **Retention Policy** to balance live high-frequency data with long-term historical storage."
