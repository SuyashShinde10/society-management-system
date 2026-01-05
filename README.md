# Society Management System
An industrial-grade platform for managing residential societies, wings, and financial expenses.

## 🏗 System Architecture
- **Admin Portal:** Deploy society structures (Wings, Floors, Flats).
- **Financial Module:** Track and manage society expenses.
- **Communication:** Digital notice boards for residents.

## 🔒 Security & Deployment
- **Backend:** Deployed on Vercel as a Serverless Function.
- **CORS:** Configured for cross-origin security between frontend and backend.
- **Database:** MongoDB Atlas with IP Whitelisting (0.0.0.0/0).

## 📡 API Endpoints
- `POST /api/auth/register` - Initialize society deployment.
- `POST /api/auth/login` - Authenticate admin/resident.
- `GET /api/notices` - Fetch active society announcements.
