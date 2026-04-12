# 🚀 ProductivityOS — Personal Productivity Tracker

A full-stack web application for tracking habits, study hours, and daily productivity — with analytics, streaks, goal setting, and smart insights.

![ProductivityOS Dashboard](https://via.placeholder.com/1200x630/0d0d14/6366f1?text=ProductivityOS+Dashboard)

---

## ✨ Features

### 🔐 Authentication
- Secure signup & login with JWT authentication
- Password hashing with **bcrypt** (12 salt rounds)
- Token-based session management
- Auto-logout on token expiry
- Rate limiting on auth endpoints (10 req/15 min)

### 📋 Habit Management
- Create, edit, delete habits with name, category, icon, color
- 9 categories: Study, Health, Personal, Work, Fitness, Mindfulness, Creative, Social, Other
- Daily logging: hours spent, completion status, mood (1–5), notes
- **Automatic streak tracking** (current streak + longest streak)
- Target hours/day and target days/week per habit

### 📊 Dashboard & Analytics
- Overview: today's hours, weekly hours, monthly hours
- **Daily area chart** — 30-day activity timeline
- **Weekly bar chart** — 12-week comparison
- **Category pie chart** — time distribution by habit type
- **Day-of-week heatmap** — average hours per weekday
- Real-time data refresh

### 💡 Smart Insights
- "You are X% more productive on weekdays" (or weekends)
- "Your longest streak is X days"
- "You're on a Y-day streak. Keep going!"
- "Most consistent habit" detection
- **At-risk goal warnings** — predicts if you'll miss targets
- Motivational nudges for low-activity weeks

### 🎯 Goal Setting
- Set daily, weekly, or monthly hour goals per habit
- Visual progress bars with percentage completion
- At-risk detection based on time remaining vs progress
- Goal achievement celebration
- Auto date range calculation by period type

### 📤 Data Export
- One-click CSV export of all habit logs
- Includes: date, habit, category, hours, completion, notes, mood

### 🎨 UI/UX
- **Dark mode** with system preference detection
- Responsive design — mobile + desktop
- Custom fonts: **Syne** (display) + **DM Sans** (body)
- Smooth animations and micro-interactions
- Streak badges with fire emoji 🔥
- Mood selector with emoji scale

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6 |
| Charts | Recharts |
| Animations | CSS animations + Framer Motion |
| HTTP Client | Axios |
| Notifications | React Hot Toast |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Authentication | JWT (jsonwebtoken) |
| Password Hashing | bcryptjs |
| Validation | express-validator |
| Security | Helmet, CORS, rate-limit |
| Scheduling | node-cron |
| Dev Server | Nodemon |

---

## 📁 Project Structure

```
productivity-tracker/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── authController.js       # Login, signup, me, logout
│   │   │   ├── habitController.js      # Habit CRUD + stats
│   │   │   ├── logController.js        # Daily logging + streak calc
│   │   │   ├── analyticsController.js  # Dashboard data + insights
│   │   │   ├── goalController.js       # Goal CRUD
│   │   │   └── userController.js       # Profile + preferences
│   │   ├── models/
│   │   │   ├── User.js                 # User schema + password hashing
│   │   │   ├── Habit.js                # Habit schema + categories
│   │   │   ├── HabitLog.js             # Daily log schema
│   │   │   └── Goal.js                 # Goal schema
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── habits.js
│   │   │   ├── logs.js
│   │   │   ├── analytics.js
│   │   │   ├── goals.js
│   │   │   └── users.js
│   │   ├── middleware/
│   │   │   └── auth.js                 # JWT verification middleware
│   │   ├── utils/
│   │   │   ├── database.js             # MongoDB connection
│   │   │   ├── cron.js                 # Scheduled jobs
│   │   │   └── seed.js                 # Demo data seeder
│   │   ├── app.js                      # Express app setup
│   │   └── server.js                   # Entry point
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── pages/
    │   │   ├── LoginPage.js            # Auth UI with demo fill
    │   │   ├── SignupPage.js           # Registration
    │   │   ├── DashboardPage.js        # Main analytics dashboard
    │   │   ├── TodayPage.js            # Daily habit logging
    │   │   ├── HabitsPage.js           # Habit management CRUD
    │   │   ├── AnalyticsPage.js        # Deep analytics + charts
    │   │   ├── GoalsPage.js            # Goal setting
    │   │   └── SettingsPage.js         # Profile + preferences
    │   ├── components/
    │   │   └── ui/
    │   │       └── AppLayout.js        # Sidebar + navigation shell
    │   ├── context/
    │   │   ├── AuthContext.js          # Auth state + JWT management
    │   │   └── ThemeContext.js         # Dark/light mode
    │   ├── hooks/
    │   │   └── useData.js              # useHabits, useAnalytics, useGoals, useTodayLogs
    │   ├── services/
    │   │   └── api.js                  # Axios instance + all API calls
    │   ├── App.js                      # Routing
    │   ├── index.js
    │   └── index.css                   # Design system + CSS variables
    └── package.json
```

---

## 🗄 Database Schema

### User
```js
{
  name: String,
  email: String (unique),
  password: String (hashed, never returned),
  timezone: String,
  preferences: {
    darkMode: Boolean,
    emailReminders: Boolean,
    weeklyReport: Boolean,
    reminderTime: String  // "HH:MM"
  },
  lastLogin: Date
}
```

### Habit
```js
{
  user: ObjectId (ref: User),
  name: String,
  description: String,
  category: Enum[Study, Health, Personal, Work, Fitness, Mindfulness, Creative, Social, Other],
  color: String (hex),
  icon: String (emoji),
  targetHoursPerDay: Number,
  targetDaysPerWeek: Number,
  currentStreak: Number,    // auto-calculated
  longestStreak: Number,    // auto-calculated
  totalHoursLogged: Number, // cumulative
  totalDaysLogged: Number,  // cumulative
  isActive: Boolean
}
```

### HabitLog
```js
{
  user: ObjectId (ref: User),
  habit: ObjectId (ref: Habit),
  date: Date,              // stored as UTC start-of-day
  hoursSpent: Number,      // 0–24
  completed: Boolean,
  notes: String,
  mood: Number (1–5)
}
// Unique constraint: user + habit + date
```

### Goal
```js
{
  user: ObjectId (ref: User),
  habit: ObjectId (ref: Habit),
  title: String,
  type: Enum[daily, weekly, monthly],
  targetHours: Number,
  startDate: Date,
  endDate: Date,
  isActive: Boolean,
  achieved: Boolean
}
```

---

## 🌐 API Routes

### Auth (`/api/auth`)
| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| POST | `/signup` | Register new user | ❌ |
| POST | `/login` | Login, returns JWT | ❌ |
| GET | `/me` | Get current user | ✅ |
| POST | `/logout` | Logout (client-side) | ✅ |

### Habits (`/api/habits`)
| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| GET | `/` | Get all user habits | ✅ |
| POST | `/` | Create habit | ✅ |
| PUT | `/:id` | Update habit | ✅ |
| DELETE | `/:id` | Soft delete habit | ✅ |
| GET | `/:id/stats` | Habit stats (30-day) | ✅ |

### Logs (`/api/logs`)
| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| POST | `/` | Create or update log (upsert) | ✅ |
| GET | `/` | Get logs by date (`?date=YYYY-MM-DD`) | ✅ |
| GET | `/range` | Get logs in range (`?start=&end=`) | ✅ |
| DELETE | `/:id` | Delete a log | ✅ |

### Analytics (`/api/analytics`)
| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| GET | `/dashboard` | Full dashboard data | ✅ |
| GET | `/export` | Download CSV | ✅ |

### Goals (`/api/goals`)
| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| GET | `/` | Get all active goals | ✅ |
| POST | `/` | Create goal | ✅ |
| DELETE | `/:id` | Remove goal | ✅ |

### Users (`/api/users`)
| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| PUT | `/profile` | Update name/timezone | ✅ |
| PUT | `/preferences` | Update notification prefs | ✅ |
| PUT | `/password` | Change password | ✅ |

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js v18+
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/productivity-tracker.git
cd productivity-tracker
```

### 2. Backend setup
```bash
cd backend
npm install

# Copy and fill environment variables
cp .env.example .env
```

Edit `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/productivity-tracker
JWT_SECRET=your_very_secret_key_change_this_in_production
JWT_EXPIRES_IN=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

```bash
# Seed demo data (optional)
npm run seed

# Start development server
npm run dev
```

### 3. Frontend setup
```bash
cd ../frontend
npm install

# Copy env
cp .env.example .env
# REACT_APP_API_URL=http://localhost:5000/api

# Start development server
npm start
```

The app will open at `http://localhost:3000`.

**Demo login:** `demo@example.com` / `demo123456`

---

## 🚢 Deployment

### Backend → Render.com
1. Create a new **Web Service** on Render
2. Connect your GitHub repo
3. Set:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `node src/server.js`
4. Add environment variables in Render dashboard
5. Use a **MongoDB Atlas** connection string for `MONGODB_URI`

### Frontend → Vercel
1. Import your GitHub repo on Vercel
2. Set **Root Directory** to `frontend`
3. Add environment variable: `REACT_APP_API_URL=https://your-backend.onrender.com/api`
4. Deploy!

### MongoDB Atlas (Free Tier)
1. Create account at mongodb.com/atlas
2. Create a free M0 cluster
3. Whitelist `0.0.0.0/0` for Render access
4. Get connection string and use in `MONGODB_URI`

---

## 🔒 Security Features

- **Helmet.js** — HTTP security headers
- **CORS** — Restricted to frontend origin
- **Rate limiting** — 100 req/15min global, 10 req/15min auth
- **bcrypt** — Password hashing with 12 salt rounds
- **JWT** — Signed tokens with expiry
- **Input validation** — express-validator on all routes
- **Mongoose** — Schema validation + sanitization
- **Soft deletes** — Habits are deactivated, not destroyed

---

## 🎨 UI Design System

### Typography
- **Display font:** Syne (headers, numbers, logo)
- **Body font:** DM Sans (UI text, labels)

### Color Palette
| Token | Light | Dark |
|-------|-------|------|
| Background | `#f8f7f4` | `#0d0d14` |
| Card | `#ffffff` | `#16161f` |
| Accent | `#6366f1` | `#818cf8` |
| Success | `#10b981` | `#34d399` |
| Warning | `#f59e0b` | `#fbbf24` |
| Danger | `#ef4444` | `#f87171` |

### Design Principles
- CSS custom properties for all tokens — instant dark mode
- `--radius-*` scale: 8px, 12px, 18px, 24px
- `--shadow-*` scale: sm, md, lg
- `--transition: 0.2s ease` for all interactive elements

---

## 📈 Roadmap / Future Features

- [ ] Google OAuth login
- [ ] Real-time updates with Socket.io
- [ ] Mobile app (React Native)
- [ ] Calendar heatmap view (like GitHub contributions)
- [ ] Habit templates / public library
- [ ] Team/accountability partner feature
- [ ] Pomodoro timer integration
- [ ] AI-powered habit recommendations

---

## 🤝 Contributing

1. Fork the repo
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit: `git commit -m 'Add amazing feature'`
4. Push: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

MIT License — free for personal and commercial use.

---

Built with ❤️ for productivity nerds. If this helped you, give it a ⭐ on GitHub!
