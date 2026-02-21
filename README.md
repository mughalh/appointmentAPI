# 📅 AppointMaster - Smart Appointment Booking System

A modern, full-stack appointment booking system built with the MERN stack (MongoDB, Express.js, React, Node.js). Features a beautiful Metro-style UI, role-based access control, and intelligent scheduling algorithms.

## ✨ Features

### 🎯 Core Features
- **Smart Scheduling** - Intelligent appointment booking with conflict detection
- **Real-time Availability** - Live availability checking for service providers
- **Multi-provider Support** - Manage multiple employees and services
- **Email Notifications** - Automated email confirmations and reminders
- **Role-based Access** - Separate interfaces for Customers, Providers, and Admins

### 👥 User Roles

#### 🧑 Customer
- Browse and search services
- Book appointments with preferred providers
- View appointment history and status
- Leave reviews for completed appointments
- Save favorite services and providers
- Manage profile and preferences

#### 💼 Service Provider
- Professional dashboard with analytics
- Manage appointments and schedule
- Set working hours and availability
- View customer information and history
- Accept/reject booking requests
- Track earnings and performance metrics

#### 👑 Administrator
- Full system oversight
- User management (activate/suspend/delete)
- Service management (add/edit/delete)
- View all appointments
- System analytics and reports
- Configuration management

### 🎨 UI/UX Highlights
- **Metro Design Language** - Clean, modern Windows 11-inspired interface
- **Responsive Layout** - Seamless experience on desktop, tablet, and mobile
- **Dark/Light Mode** - Theme support for user preference
- **Smooth Animations** - Framer Motion powered transitions
- **Interactive Cards** - Hover effects and micro-interactions

### 🔧 Technical Features
- **JWT Authentication** - Secure token-based authentication
- **RESTful API** - Well-structured API endpoints
- **MongoDB Integration** - Flexible NoSQL database
- **Real-time Updates** - Live availability checking
- **Advanced Filtering** - Search, sort, and filter capabilities
- **File Upload** - Profile picture support
- **Error Handling** - Comprehensive error management

## 🚀 Tech Stack

### Frontend
- **React 18** - UI library
- **React Router 6** - Navigation
- **Axios** - HTTP client
- **Framer Motion** - Animations
- **React Icons** - Icon library
- **Date-fns** - Date manipulation
- **CSS3** - Custom styling with Metro design

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Multer** - File upload
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing

## 📋 Prerequisites

- **Node.js** (v14 or higher)
- **MongoDB** (local installation or MongoDB Atlas account)
- **npm** or **yarn** package manager
- **Git** (for cloning the repository)

## 🛠️ Installation

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/appointmaster.git
cd appointmaster
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your configuration
```

**`.env` configuration:**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/appointment_system
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:5173
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/jpg
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

**`.env` configuration:**
```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Start MongoDB

**Windows:**
```bash
net start MongoDB
```

**macOS:**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongod
```

### 5. Run the Application

**Backend:**
```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

**Frontend:**
```bash
cd frontend
npm run dev
# App runs on http://localhost:5173
```

## 📁 Project Structure

```
appointmaster/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Custom middleware
│   │   ├── utils/           # Utility functions
│   │   └── app.js           # Express app setup
│   ├── uploads/             # Uploaded files
│   ├── .env                 # Environment variables
│   ├── package.json
│   └── server.js            # Entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── context/         # React context
│   │   ├── styles/          # CSS files
│   │   ├── utils/           # Utility functions
│   │   ├── App.jsx          # Main app component
│   │   └── main.jsx         # Entry point
│   ├── public/              # Static assets
│   ├── .env                 # Environment variables
│   └── package.json
│
└── README.md
```

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | User login |
| GET | `/api/auth/profile` | Get user profile |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Get all users (admin) |
| GET | `/api/users/:id` | Get user by ID |
| PUT | `/api/users/profile` | Update profile |
| POST | `/api/users/change-password` | Change password |
| GET | `/api/users/activity` | Get user activity |
| GET | `/api/users/stats` | Get user statistics |

### Services
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/services` | Get all services |
| GET | `/api/services/:id` | Get service by ID |
| POST | `/api/services` | Create service |
| PUT | `/api/services/:id` | Update service |
| DELETE | `/api/services/:id` | Delete service |
| GET | `/api/services/popular` | Get popular services |

### Employees
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/employees` | Get all employees |
| GET | `/api/employees/:id` | Get employee by ID |
| GET | `/api/employees/my-profile` | Get provider profile |
| POST | `/api/employees` | Create/update employee |
| GET | `/api/employees/:id/availability` | Check availability |

### Appointments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/appointments/my-appointments` | Get customer appointments |
| GET | `/api/appointments/provider` | Get provider appointments |
| POST | `/api/appointments` | Create appointment |
| PATCH | `/api/appointments/:id/status` | Update status |
| PATCH | `/api/appointments/:id/cancel` | Cancel appointment |

## 🎯 Key Features Explained

### Smart Conflict Detection
Uses interval tree algorithm to efficiently check for scheduling conflicts in O(log n) time.

### Real-time Availability
Calculates available time slots based on:
- Employee working hours
- Existing appointments
- Service duration
- Business hours

### Role-Based Access
Three distinct user roles with customized dashboards:
- **Customers** - Book and manage appointments
- **Providers** - Manage schedule and services
- **Admins** - Full system control

### Metro UI Design
Modern Windows 11-inspired interface with:
- Live tiles
- Smooth animations
- Responsive layouts
- Consistent color scheme

## 🚦 Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
cd frontend
npm test
```

## 📦 Deployment

### Backend Deployment (Render/Heroku)
```bash
# Set environment variables
# Update MONGODB_URI to production database
# Deploy using Git or CLI
```

### Frontend Deployment (Vercel/Netlify)
```bash
npm run build
# Deploy the dist folder
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👏 Acknowledgments

- React Icons for beautiful icons
- Framer Motion for smooth animations
- MongoDB for flexible database
- All contributors and users

## 📧 Contact

Your Name - [@yourtwitter](https://twitter.com/yourtwitter) - email@example.com

Project Link: [https://github.com/yourusername/appointmaster](https://github.com/yourusername/appointmaster)

## 🚀 Future Enhancements

- [ ] Mobile app (React Native)
- [ ] SMS notifications
- [ ] Payment integration
- [ ] Video consultations
- [ ] AI-powered recommendations
- [ ] Multi-language support
- [ ] Calendar sync (Google, Outlook)
- [ ] Analytics dashboard
- [ ] Customer loyalty program
- [ ] Bulk appointment scheduling

---

**Made with ❤️ using the MERN stack**
