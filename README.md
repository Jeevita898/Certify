Certify – VTU Activity & Certificate Management System - https://certify-sand.vercel.app

Certify is a full-stack web application developed for managing VTU student activity certificates, approvals, and activity points in a centralized and transparent manner. The system provides separate dashboards for Students, Faculty Proctors, and Admins with role-based access control, certificate verification workflows, analytics, leaderboard features, and real-time notifications.

Features

Student Module
Upload activity certificates
Track approval/rejection status
View earned VTU points
Real-time notifications
Leaderboard and badge system
Student profile dashboard

Faculty Module
Review submitted certificates
Approve or reject activities
Assign activity points
AI review insights panel
Download reports

Admin Module
Manage faculty and events
System analytics dashboard
Approval/rejection statistics
Top student tracking
Activity category analytics

Smart Features
OCR-based certificate parsing (planned)
Duplicate/fraud detection logic
Activity recommendation engine
Certificate trust score
Real-time notifications using Socket.io
Gamification leaderboard and badges

Tech Stack

Frontend
HTML5
CSS3
JavaScript

Backend
Node.js
Express.js

Database
MongoDB Atlas

Other Technologies
JWT Authentication
Socket.io
Cloudinary
Chart.js
Render
Vercel

Project Structure
Certify/
│
├── backend/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── utils/
│   ├── server.js
│
├── certify/
│   ├── css/
│   ├── js/
│   ├── pages/
│   ├── index.html
│
├── .gitignore
└── README.md

Installation
Clone Repository
git clone https://github.com/Jeevita898/Certify.git
cd Certify

Backend Setup
cd backend
npm install

Create .env file:
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_URL=http://127.0.0.1:5500
NODE_ENV=development

Run backend:
npm start
Frontend Setup

Open frontend using VS Code Live Server:
certify/index.html

Deployment
Frontend
Hosted on Vercel
Backend
Hosted on Render
