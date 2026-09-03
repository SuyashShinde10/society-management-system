# Deployment Strategy

This repository supports **two mutually exclusive** deployment strategies depending on your infrastructure preferences. 

> **Important**: You must choose *either* Vercel (Serverless) *or* Docker (Containerized). Do not attempt to mix them.

---

## Option A: Serverless via Vercel (Current Primary)

This strategy utilizes Vercel's serverless functions for the Node.js backend and Vercel's static hosting for the React frontend.

**Pros**: Zero-config SSL, global CDN, auto-scaling, very low cost.
**Cons**: Requires a separate persistent worker process (e.g., Render, Railway) for BullMQ queues (emails, AI, PDFs). Serverless functions cannot run long-lived queue listeners.

### Steps:
1. Push your code to GitHub.
2. Import the project in the Vercel Dashboard.
3. Configure Environment Variables in the Vercel UI for both Frontend (`VITE_API_URL`) and Backend (see `.env.example`).
4. Ensure your separate worker process is deployed and connected to the same Redis instance.

---

## Option B: Containerized via Docker Compose

This strategy deploys the entire stack (Frontend, Backend, MongoDB, Redis) as containers.

**Pros**: Complete control, single server deployment, natively supports BullMQ long-running workers alongside the web server.
**Cons**: Requires managing your own VPS, SSL certificates (e.g., Nginx proxy), and scaling manually.

### Steps:
1. Ensure Docker and Docker Compose are installed on your target server.
2. Copy `.env.example` to `.env` in the root directory and populate production secrets (including `JWT_SECRET`).
3. Run `docker-compose up -d --build`.
4. The system will start on port `80` (Frontend) and `5000` (Backend). You should place an Nginx reverse proxy in front of this to handle SSL/TLS.
