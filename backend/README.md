# Certify — Activity Point Management System

Full-stack web app: MERN stack (MongoDB, Express, React-free vanilla JS, Node.js)

---

## Folder Structure

```
project/
├── backend/               ← Node.js + Express API
│   ├── server.js
│   ├── package.json
│   ├── .env.example
│   ├── config/
│   │   └── cloudinary.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── activityController.js
│   │   ├── eventController.js
│   │   └── userController.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Activity.js
│   │   ├── Event.js
│   │   └── Notification.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── studentRoutes.js
│   │   ├── facultyRoutes.js
│   │   ├── activityRoutes.js
│   │   ├── eventRoutes.js
│   │   ├── notificationRoutes.js
│   │   └── adminRoutes.js
│   └── utils/
│       └── seed.js
│
└── certify/               ← Frontend (plain HTML/CSS/JS)
    ├── index.html
    ├── css/style.css
    ├── js/
    │   ├── auth.js        ← all API calls + session helpers
    │   └── utils.js       ← formatDate, toast, sidebar builder
    └── pages/
        ├── login.html
        ├── signup.html
        ├── student-dashboard.html
        ├── add-activity.html
        ├── student-profile.html
        ├── events.html
        ├── notifications.html
        ├── faculty-dashboard.html
        ├── faculty-profile.html
        ├── admin-dashboard.html
        ├── admin-events.html
        └── admin-faculty.html
```

---

## Prerequisites

Install these before starting:

| Tool        | Version  | Download |
|-------------|----------|----------|
| Node.js     | v18+     | https://nodejs.org |
| MongoDB     | Local OR Atlas | https://www.mongodb.com |
| VS Code     | Any      | For editing |
| Live Server | VS Code extension | For frontend |

---

## Step 1 — Set up MongoDB

**Option A — Local MongoDB:**
1. Install MongoDB Community: https://www.mongodb.com/try/download/community
2. Start it: `mongod` (or it runs as a service automatically)
3. Your URI will be: `mongodb://localhost:27017/certify`

**Option B — MongoDB Atlas (cloud, free tier):**
1. Go to https://cloud.mongodb.com → Create free account
2. Create a new cluster (free M0 tier)
3. Under "Database Access" → Add a user with password
4. Under "Network Access" → Add IP `0.0.0.0/0` (allow all)
5. Click "Connect" → "Drivers" → Copy the connection string
6. It looks like: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/certify`

---

## Step 2 — Set up Cloudinary

1. Go to https://cloudinary.com → Sign up free
2. Go to Dashboard
3. Copy your **Cloud name**, **API Key**, **API Secret**
4. You will paste these into the `.env` file in the next step

---

## Step 3 — Configure the backend

```bash
# Go into the backend folder
cd backend

# Copy the example env file
cp .env.example .env
```

Now open `.env` and fill in your values:

```env
MONGO_URI=mongodb://localhost:27017/certify
JWT_SECRET=any_long_random_string_here_eg_certify_super_secret_2024
JWT_EXPIRES_IN=7d
PORT=5000
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
CLIENT_URL=http://127.0.0.1:5500
NODE_ENV=development
```

> **Important:** CLIENT_URL must match the address where your frontend opens.
> If you use VS Code Live Server it is usually http://127.0.0.1:5500

---

## Step 4 — Install backend dependencies

```bash
cd backend
npm install
```

---

## Step 5 — Seed the database (faculty + admin)

Run this ONCE to insert the admin and 5 faculty into MongoDB:

```bash
cd backend
npm run seed
```

You will see output like:
```
✅ Connected to MongoDB
📌 Seeding admin...
  ✅  Inserted: admin@college.edu
📌 Seeding faculty...
  ✅  Inserted: anitha.rao@college.edu
  ✅  Inserted: suresh.kumar@college.edu
  ...
🎉 Seeding complete!
```

**Safe to re-run** — it skips emails that already exist.

---

## Step 6 — Start the backend server

```bash
cd backend
npm run dev        # uses nodemon (auto-restarts on file changes)
# OR
npm start          # plain node
```

You should see:
```
✅ MongoDB connected
🚀 Server running on http://localhost:5000
```

Test it: open http://localhost:5000/api/health in browser.
You should get: `{"status":"OK","message":"Certify API is running"}`

---

## Step 7 — Run the frontend

1. Open the `certify/` folder in VS Code
2. Install the **Live Server** extension (if not already)
3. Right-click `index.html` → **"Open with Live Server"**
4. Browser opens at `http://127.0.0.1:5500`

> **Important:** The frontend's `js/auth.js` has `API_BASE = 'http://localhost:5000/api'`.
> Make sure your backend is running on port 5000 before using the frontend.

---

## API Endpoints Reference

### Auth
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | /api/auth/login | Public | Login (all roles) |
| POST | /api/auth/register | Public | Student registration |
| GET  | /api/auth/me | Any logged-in | Get current user |

### Faculty
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | /api/faculty/list | Public | Get faculty list (for signup dropdown) |
| GET | /api/faculty/profile | Faculty | Get own profile + assigned students |
| GET | /api/faculty/students | Faculty | Get assigned students with stats |

### Activities (Certificates)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | /api/activities | Student | Upload certificate (multipart/form-data) |
| GET  | /api/activities/my | Student | Get own activities |
| GET  | /api/activities/faculty | Faculty | Get assigned students' activities |
| PATCH | /api/activities/:id/validate | Faculty | Approve or reject |
| GET  | /api/activities/all | Admin | Get all activities |

### Events
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET  | /api/events | Public | List all events |
| GET  | /api/events/my | Student | Student's registered events |
| GET  | /api/events/:id | Public | Single event detail |
| POST | /api/events | Admin | Create event |
| PUT  | /api/events/:id | Admin | Update event |
| DELETE | /api/events/:id | Admin | Delete event |
| POST | /api/events/:id/register | Student | Register for event |

### Notifications
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET  | /api/notifications | Student | Get notifications |
| PATCH | /api/notifications/read-all | Student | Mark all as read |
| PATCH | /api/notifications/:id/read | Student | Mark one as read |

### Students
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET  | /api/students/profile | Student | Get own profile (with proctor info) |
| PUT  | /api/students/profile | Student | Update profile |
| GET  | /api/students/stats | Student | Get activity stats |

### Admin
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET  | /api/admin/stats | Admin | System-wide stats |
| GET  | /api/admin/students | Admin | All students |
| GET  | /api/admin/activities | Admin | All activities |

---

## Login Credentials

> These are NOT shown anywhere in the application UI.

### Admin
| Field    | Value |
|----------|-------|
| Email    | admin@college.edu |
| Password | Admin@2024 |

### Faculty (all share same password)
| Name | Email | Password |
|------|-------|----------|
| Dr. Anitha Rao | anitha.rao@college.edu | Faculty@123 |
| Prof. Suresh Kumar | suresh.kumar@college.edu | Faculty@123 |
| Dr. Meena Sharma | meena.sharma@college.edu | Faculty@123 |
| Prof. Rajesh Nair | rajesh.nair@college.edu | Faculty@123 |
| Dr. Kavitha Bhat | kavitha.bhat@college.edu | Faculty@123 |

### Students
Students self-register at `signup.html` — no pre-set credentials needed.

---

## Common Errors & Fixes

| Error | Fix |
|-------|-----|
| `MongooseServerSelectionError` | MongoDB is not running. Start `mongod` or check Atlas URI |
| `Cannot GET /api/...` | Backend not started. Run `npm run dev` |
| `CORS error` in browser | Check `CLIENT_URL` in `.env` matches your Live Server address |
| `Invalid token` | JWT_SECRET mismatch or token expired. Clear localStorage and login again |
| Cloudinary upload fails | Check CLOUDINARY_* values in `.env`. Test at https://cloudinary.com/console |
| Faculty list empty on signup | Run `npm run seed` first |
| `multer-storage-cloudinary` error | Run `npm install` again — all packages must be installed |
