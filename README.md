# Certify – VTU Activity & Certificate Management System

🌐 Live Website:  
https://certify-sand.vercel.app

Certify is a full-stack web application developed for managing VTU student activity certificates, approvals, and activity points in a centralized and transparent manner.

The system provides separate dashboards for Students, Faculty Proctors, and Admins with role-based access control, certificate verification workflows, analytics, leaderboard features, AI-assisted validation, and real-time notifications.

---

# Features

## Student Module
- Upload activity certificates
- Track approval/rejection status
- View earned VTU points
- Real-time notifications
- Leaderboard and badge system
- Student profile dashboard
- Certificate trust score generation
- AI-based duplicate certificate checking

## Faculty Module
- Review submitted certificates
- Approve or reject activities
- Assign activity points
- AI review insights panel
- Download reports
- Fraud risk analysis
- Duplicate activity detection
- AI-generated activity briefing

## Admin Module
- Manage faculty and events
- System analytics dashboard
- Approval/rejection statistics
- Top student tracking
- Activity category analytics

## Smart Features
- OCR-based certificate text extraction
- AI-powered duplicate certificate detection
- Activity recommendation engine
- Certificate trust score analysis
- Fraud flag detection
- Real-time notifications using Socket.io
- Gamification leaderboard and badges

---

# Tech Stack

## Frontend
- HTML5
- CSS3
- JavaScript

## Backend
- Node.js
- Express.js

## Database
- MongoDB Atlas

## Other Technologies
- JWT Authentication
- Socket.io
- Cloudinary
- Chart.js
- Tesseract.js OCR
- Render
- Vercel

---

# AI Modules

## Certificate Parser
- OCR-based certificate extraction
- Rule-based trust score generation
- Fraud keyword detection
- Metadata validation
- Category recommendation

:contentReference[oaicite:0]{index=0}

## Duplicate Detector
- Semantic keyword extraction
- Jaccard similarity matching
- Duplicate activity detection
- Cross-student fraud detection
- Time-window similarity analysis

:contentReference[oaicite:1]{index=1}

## Faculty AI Assistant
- Automated risk assessment
- Fraud analysis
- Smart point recommendation
- Duplicate activity warnings
- Student activity behavior analysis

:contentReference[oaicite:2]{index=2}

---

# Project Structure

```bash
Certify/
│
├── backend/
│   ├── ai/
│   │   ├── certificateParser.js
│   │   ├── duplicateDetector.js
│   │   └── facultyAssistant.js
│   │
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── utils/
│   └── server.js
│
├── certify/
│   ├── css/
│   ├── js/
│   ├── pages/
│   └── index.html
│
├── .gitignore
└── README.md
```

---

# Installation & Setup

## 1. Clone Repository

```bash
git clone https://github.com/Jeevita898/Certify.git
cd Certify
```

---

## 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file inside backend folder:

```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_URL=http://127.0.0.1:5500
NODE_ENV=development
```

Run backend:

```bash
npm start
```

---

## 3. Frontend Setup

Open frontend using VS Code Live Server:

```bash
certify/index.html
```

---

# Deployment

## Frontend Deployment (Vercel)

1. Push project to GitHub
2. Import repository into Vercel
3. Set root directory as:

```bash
certify
```

4. Deploy frontend

Frontend URL:
https://certify-sand.vercel.app

---

## Backend Deployment (Render)

1. Create new Web Service on Render
2. Connect GitHub repository
3. Set root directory as:

```bash
backend
```

4. Build Command:

```bash
npm install
```

5. Start Command:

```bash
npm start
```

6. Add environment variables from `.env`
7. Deploy backend

Backend URL:
https://certify-eix1.onrender.com

---

# Future Improvements

- Email notification system
- Mobile application support
- AI-based activity recommendations
- Advanced PDF analytics reports
- Multi-university support
- Blockchain certificate verification

---

# Author

Jeevita Devadig  
BMS College of Engineering
