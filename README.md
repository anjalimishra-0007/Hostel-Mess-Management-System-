# 🏢 HostelHub — Hostel Room Allotment & Mess Management System

A full-stack web application for university hostel management built with **Node.js**, **Express.js**, **EJS templates**, and **MongoDB (Mongoose)**.

---

## ✨ Features

### 👨‍💼 Admin / Warden Portal
- **Dashboard**: Real-time stats (total students, room occupancy %, active maintenance requests, bed counters, block-wise stats).
- **Block Management**: Add, view, and manage hostel blocks (Boys/Girls wings).
- **Room Management**: Add rooms (Single, Double, Triple) with capacity enforcement and real-time bed availability tracking.
- **Room Requests**: Review, approve, and assign specific rooms to student applicants.
- **Room Change Requests**: Process room transfer and swap requests.
- **Maintenance Tracking**: View, update status (Pending, In Progress, Resolved), and add admin remarks for maintenance issues.
- **Weekly Mess Menu**: Update breakfast, lunch, snacks, and dinner menus for all 7 days.
- **Meal Feedback**: Review student ratings (1–5 stars) and comments for mess meals.

### 🎓 Student Portal
- **Dashboard**: Quick overview of room allotment status, active requests, and today's mess menu.
- **Room Request**: Submit preferences for hostel block and room type (single, double, triple).
- **My Room**: View allocated room details, floor, block, and list of roommates.
- **Room Change**: Request room reallocation with custom reasoning.
- **Maintenance**: Raise issue tickets (plumbing, electrical, cleaning, furniture, etc.) and track progress.
- **Mess Menu**: View current 7-day meal schedules.
- **Meal Feedback**: Submit 1–5 star ratings and reviews for meals.

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+)
- [MongoDB](https://www.mongodb.com/) (running locally or MongoDB Atlas connection string)

### 1. Installation
The dependencies are already pre-installed, but if needed:
```bash
npm install
```

### 2. Environment Variables
Check `.env`:
```env
MONGODB_URI=mongodb://127.0.0.1:27017/hostel_management
SESSION_SECRET=hostel_secret_key_2026
PORT=3000
```

### 3. Database Seeding (Optional)
To pre-populate sample blocks, rooms, mess menu, admin, and student accounts:
```bash
npm run seed
```

### 4. Start the Application
```bash
npm start
```
Open your browser and navigate to: **`http://localhost:3000`**

---

## 🔑 Default Test Credentials

| Role | Name | Email | Password |
|---|---|---|---|
| **Admin / Warden** | Dr. Rajesh Warden | `admin@hostel.com` | `password123` |
| **Student** | Aarav Sharma | `aarav@student.com` | `password123` |
| **Student** | Priya Patel | `priya@student.com` | `password123` |
| **Student** | Rohan Verma | `rohan@student.com` | `password123` |

*(You can also register new Student or Admin accounts directly at `/register`)*

---

## 📁 Project Structure

```text
hostel-mess-management/
├── .env                    # Environment variables
├── app.js                  # Main Express server configuration
├── middleware/
│   └── auth.js             # Authentication & role verification middleware
├── models/
│   ├── Block.js            # Hostel blocks schema
│   ├── MealFeedback.js     # Mess meal feedback & ratings
│   ├── MaintenanceRequest.js# Maintenance tickets
│   ├── MessBill.js         # Student mess billing
│   ├── MessMenu.js         # Weekly 7-day menu
│   ├── Room.js             # Rooms & occupancy tracking
│   ├── RoomChangeRequest.js# Room change requests
│   ├── RoomRequest.js      # Room allotment requests
│   └── User.js             # User accounts (Admin / Student)
├── public/
│   ├── css/
│   │   └── style.css       # Premium dark-mode glassmorphic styles
│   └── js/
│       └── main.js         # Client-side interactivity
├── routes/
│   ├── admin.js            # Admin management routes
│   ├── auth.js             # Authentication routes (login, register, logout)
│   ├── index.js            # Landing page route
│   └── student.js          # Student portal routes
├── seed.js                 # Sample database seeder
└── views/                  # EJS template views
    ├── admin/              # Admin pages
    ├── auth/               # Login & Register views
    ├── partials/           # Navbar, Sidebar, Flash, Footer
    ├── student/            # Student pages
    ├── error.ejs           # Error handling view
    ├── index.ejs           # Public landing page
    └── layout.ejs          # Master layout wrapper
```
