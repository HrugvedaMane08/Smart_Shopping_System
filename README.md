# IoT-Based Smart Shopping and Real-Time Inventory Management System

A full-stack web application simulating an IoT-enabled retail experience — customers scan RFID-tagged products (via simulator now, real ESP32 hardware later) which instantly updates their cart, decrements inventory, and reflects live on both customer and manager dashboards via Socket.IO.

## Tech Stack

**Frontend:** React, Vite, Tailwind CSS, React Router, Axios, Recharts, Socket.IO Client
**Backend:** Node.js, Express, Socket.IO, Mongoose, JWT
**Database:** MongoDB

## Architecture

React Frontend ↔ REST API / Socket.IO ↔ Node.js + Express ↔ MongoDB

The IoT layer (`/api/iot/rfid`, `/api/iot/product-return`) is hardware-agnostic — the IoT Simulator (built into the Manager portal) calls the exact same endpoints a physical ESP32 + RFID reader will call in a future phase. No frontend changes will be required when hardware is introduced.

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB running locally (or a connection URI to a hosted instance)

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env   # then fill in your values
npm run seed            # populates sample data
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env   # then fill in your values
npm run dev
```

### Demo Credentials (after seeding)
| Role | Email | Password |
|---|---|---|
| Manager | manager@test.com | 123456 |
| Customer | customer@test.com | 123456 |
| Customer | priya@test.com | 123456 |

## Key Features

- JWT auth with role-based access (Customer / Manager)
- Real-time cart updates via Socket.IO on every RFID scan/return
- Auto-calculated inventory status (IN_STOCK / LOW_STOCK / OUT_OF_STOCK)
- IoT Simulator that calls production IoT endpoints directly
- Manager analytics dashboard (revenue, best-sellers, category sales — all live MongoDB aggregations)
- Digital receipts and shopping history
- Live low-stock alerting

## Project Structure

/backend
/src
/controllers /models /routes /middleware /services /socket /utils
/frontend
/src
/components /pages /layouts /services /hooks /context /utils

## Future Hardware Integration

When ESP32 + MFRC522 RFID hardware is ready, it will POST to the same `/api/iot/rfid` endpoint currently used by the IoT Simulator:

ESP32 → Wi-Fi → POST /api/iot/rfid → Backend → MongoDB → Socket.IO → React

No backend or frontend redesign required — only the physical device added as a new client of the existing API.

No backend or frontend redesign required — only the physical device added as a new client of the existing API.