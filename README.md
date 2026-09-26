# SubTrack - Full-Stack MERN Subscription Tracker

SubTrack is a full-stack MERN (MongoDB, Express, React, Node.js) web application designed to help users track, manage, and optimize recurring subscriptions (Netflix, Spotify, Coursera, Gym, Utilities, etc.). It automatically normalizes expenditures to monthly/yearly figures using MongoDB aggregation pipelines, displays interactive visual category breakdowns with Recharts, and delivers automated email reminders before subscription renewals using `node-cron` and `Nodemailer`.

> **One-line Pitch:** "A MERN app that tracks recurring payments, calculates monthly spend with a MongoDB aggregation pipeline, and emails reminders before renewals using a cron job."

---

## 🌟 Key Features

- **User Authentication**: Secure JWT-based authentication with bcrypt password hashing, 7-day token expiration, and complete user data isolation.
- **Normalized Spend Analytics**: Converts weekly, monthly, and yearly subscription costs into standardized monthly totals using an optimized MongoDB aggregation pipeline.
- **Category Visualization**: Interactive donut chart generated with Recharts grouping expenditure by categories (Entertainment, Education, Utilities, Health, Software, Other).
- **Upcoming Renewals & Urgency Badges**: Real-time list of active subscriptions renewing within 7 days, highlighting imminent renewals (< 2 days) with urgency alerts.
- **Subscription Management**: Full CRUD operations with client & server validation, search by name, filtering by category/status, and instant status toggling (active/cancelled).
- **Automated Daily Email Reminders**: Scheduled daily `node-cron` job (runs at 9:00 AM) that sends email notifications via Nodemailer for upcoming renewals and automatically advances past renewal dates.
- **Dev Manual Trigger**: Non-production route (`POST /api/dev/run-reminders`) to test and trigger email reminder runs on demand.

---

## 🛠️ Tech Stack

- **Frontend**: React 18 (Vite), React Router v6, Axios, Tailwind CSS, Recharts, Lucide React Icons
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas with Mongoose ORM
- **Authentication**: JSON Web Tokens (JWT), bcryptjs
- **Email & Scheduling**: Nodemailer, node-cron
- **Validation & Security**: express-validator, Helmet, CORS, Morgan

---

## 🏗️ Architecture Overview

```
┌──────────────────────────────────────────────────────────┐
│                   React Frontend (Vite)                  │
│       (AuthContext + React Router + Axios Interceptor)   │
└────────────────────────────┬─────────────────────────────┘
                             │  REST API (JSON / Bearer JWT)
┌────────────────────────────▼─────────────────────────────┐
│                    Express.js Backend                    │
│   (Auth Middleware + Subscription Controllers + Cron)   │
└────────────────────────────┬─────────────────────────────┘
                             │  Mongoose ODM
┌────────────────────────────▼─────────────────────────────┐
│                      MongoDB Atlas                       │
│    (User Collection + Subscription Compound Index)       │
└──────────────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started Locally

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **MongoDB**: Local MongoDB instance (`mongodb://127.0.0.1:27017/subtrack`) or MongoDB Atlas connection string.

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/subtrack.git
cd subtrack
```

### 2. Backend Setup
```bash
cd server
npm install
```

Create a `.env` file inside `server/` (or copy from `.env.example`):
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/subtrack
JWT_SECRET=supersecretjwtkey_dev_2026
CLIENT_URL=http://localhost:5173
NODE_ENV=development
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
EMAIL_FROM="SubTrack <no-reply@subtrack.app>"
```

Start backend development server:
```bash
npm run dev
```

### 3. Frontend Setup
In a new terminal window:
```bash
cd client
npm install
```

Create a `.env` file inside `client/` (or copy from `.env.example`):
```env
VITE_API_URL=http://localhost:5000/api
```

Start frontend development server:
```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 🔑 Environment Variables Reference

### Server (`server/.env`)
| Variable | Description | Default / Example |
|---|---|---|
| `PORT` | Backend server port | `5000` |
| `MONGO_URI` | MongoDB connection URI | `mongodb://127.0.0.1:27017/subtrack` |
| `JWT_SECRET` | Secret key for signing JWT tokens | `your_jwt_secret` |
| `CLIENT_URL` | Allowed origin for CORS policy | `http://localhost:5173` |
| `NODE_ENV` | Environment mode (`development` / `production`) | `development` |
| `SMTP_HOST` | SMTP server host for sending emails | `smtp.mailtrap.io` |
| `SMTP_PORT` | SMTP port | `2525` / `587` |
| `SMTP_USER` | SMTP username | `your_user` |
| `SMTP_PASS` | SMTP password | `your_pass` |
| `EMAIL_FROM` | Sender email header string | `"SubTrack <no-reply@subtrack.app>"` |

### Client (`client/.env`)
| Variable | Description | Default / Example |
|---|---|---|
| `VITE_API_URL` | Base API URL for Axios requests | `http://localhost:5000/api` |

---

## 📡 REST API Endpoints

### Auth Routes (`/api/auth`)
| Method | Route | Description | Auth Required |
|---|---|---|---|
| POST | `/api/auth/register` | Register new user & return token | No |
| POST | `/api/auth/login` | Authenticate user & return token | No |
| GET | `/api/auth/me` | Fetch currently logged-in user profile | Yes |

### Subscription Routes (`/api/subscriptions`)
| Method | Route | Description | Auth Required |
|---|---|---|---|
| GET | `/api/subscriptions` | List user subscriptions (supports `?search=`, `?category=`, `?status=`) | Yes |
| POST | `/api/subscriptions` | Create a new subscription | Yes |
| GET | `/api/subscriptions/stats` | Aggregated monthly/yearly spend and category stats | Yes |
| GET | `/api/subscriptions/upcoming` | Active subscriptions renewing in next 7 days | Yes |
| GET | `/api/subscriptions/:id` | Fetch single subscription details | Yes |
| PUT | `/api/subscriptions/:id` | Update subscription details | Yes |
| DELETE | `/api/subscriptions/:id` | Delete subscription | Yes |

### Dev Routes (`/api/dev`)
| Method | Route | Description | Auth Required |
|---|---|---|---|
| POST | `/api/dev/run-reminders` | Manually trigger reminder cron job (non-prod only) | No |

---

## 🧮 Technical Highlights & Core Logic

### 1. Monthly Equivalent Billing Math (`utils/billing.js`)
To compute accurate monthly totals across varying payment cycles:
- **Weekly**: `(amount * 52) / 12`
- **Monthly**: `amount`
- **Yearly**: `amount / 12`

### 2. End-of-Month & Leap Year Handling (`addCycle`)
When advancing dates by one month (e.g., `Jan 31 + 1 month`), JavaScript `Date` objects naturally overflow to `March 2/3`. `addCycle()` verifies if the day rolled over and resets the date to the last valid day of the target month (`Feb 28` or `Feb 29` in leap years).

### 3. MongoDB Aggregation Pipeline (`getSubscriptionStats`)
Calculates category breakdowns directly inside MongoDB using four pipeline stages:
1. **`$match`**: Filters active subscriptions for `req.user._id`.
2. **`$addFields`**: Evaluates `$switch` on `billingCycle` to project a normalized `monthlyAmount`.
3. **`$group`**: Groups by `category`, summing `monthlyAmount` and counting active subscriptions.
4. **`$project`**: Formats output object structure for Recharts rendering.

### 4. Automated Daily Cron Job (`reminderJob.js`)
Runs daily at 9:00 AM (`0 9 * * *`):
1. Identifies active subscriptions where `nextRenewalDate` is within `reminderDaysBefore` days from today and no email was sent yet for that renewal cycle.
2. Sends an HTML renewal reminder email via Nodemailer and sets `lastReminderSentFor = nextRenewalDate`.
3. Automatically advances past renewal dates to the next billing cycle via `advanceRenewalDate()`.

---

## 🌐 Deployment Notes

### MongoDB Atlas
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Add your server IP address (or `0.0.0.0/0` for cloud deployments) to Network Access.
3. Obtain connection string and set as `MONGO_URI`.

### Server Deployment (Render)
1. Create a **Web Service** on [Render](https://render.com) pointing to the `server/` directory.
2. Build Command: `npm install`
3. Start Command: `npm start`
4. Set Environment Variables (`MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`, `SMTP_*`).

### Client Deployment (Vercel)
1. Import repository on [Vercel](https://vercel.com) specifying Root Directory as `client`.
2. Framework Preset: `Vite`
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Set Environment Variable `VITE_API_URL=https://your-render-app.onrender.com/api`.

---

## 📸 Screenshots & Live Demo Placeholder

- **Live App Demo**: `https://subtrack-demo.vercel.app` (Placeholder)
- **API Server Endpoint**: `https://subtrack-api.onrender.com` (Placeholder)

---

## 📄 License

MIT License. Designed and built for portfolio and technical interview demonstration.
