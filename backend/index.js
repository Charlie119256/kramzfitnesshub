require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const clerkRoutes = require('./routes/clerkRoutes');
const memberRoutes = require('./routes/memberRoutes');
const planApplicationRoutes = require('./routes/planApplicationRoutes');
const membershipTypeRoutes = require('./routes/membershipTypeRoutes');
const equipmentRoutes = require('./routes/equipmentRoutes');
const bmiRoutes = require('./routes/bmiRoutes');
const receiptRoutes = require('./routes/receiptRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const workoutRoutes = require('./routes/workoutRoutes');
const adminDashboardRoutes = require('./routes/adminDashboardRoutes');
const clerkDashboardRoutes = require('./routes/clerkDashboardRoutes');
const memberDashboardRoutes = require('./routes/memberDashboardRoutes');
const expensesRoutes = require('./routes/expensesRoutes');
const earningsRoutes = require('./routes/earningsRoutes');
const membersManagementRoutes = require('./routes/membersManagementRoutes');
const sequelize = require('./config/database');

// Import model associations
require('./models/associations');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, { cors: { origin: '*' } });
app.set('io', io);

// CORS middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend server is running' });
});

// Test uploads directory
app.get('/api/test-uploads', (req, res) => {
  const fs = require('fs');
  const uploadsPath = path.join(__dirname, 'uploads');
  const profilePicturesPath = path.join(uploadsPath, 'profile-pictures');
  
  try {
    const uploadsExists = fs.existsSync(uploadsPath);
    const profilePicturesExists = fs.existsSync(profilePicturesPath);
    const files = profilePicturesExists ? fs.readdirSync(profilePicturesPath) : [];
    
    res.json({
      uploadsExists,
      profilePicturesExists,
      files,
      uploadsPath,
      profilePicturesPath
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/users', userRoutes);
app.use('/api/clerks', clerkRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/plan-applications', planApplicationRoutes);
app.use('/api/membership-types', membershipTypeRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/bmi', bmiRoutes);
app.use('/api/receipts', receiptRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/admin-dashboard', adminDashboardRoutes);
app.use('/api/clerk-dashboard', clerkDashboardRoutes);
app.use('/api/member-dashboard', memberDashboardRoutes);
app.use('/api/expenses', expensesRoutes);
app.use('/api/earnings', earningsRoutes);
app.use('/api/members-management', membersManagementRoutes);

const PORT = process.env.PORT || 5000;

sequelize.authenticate()
  .then(() => {
    console.log('Database connected.');
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
  });
