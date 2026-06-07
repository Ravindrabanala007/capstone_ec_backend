require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const adminRoutes = require('./routes/adminRoutes');
const morgan = require('morgan');
const cors = require('cors');


const app = express();
const PORT = process.env.PORT || 5000;

// Define allowed origins (your deployed frontend URL)
const allowedOrigins = [
  'https://your-frontend-domain.vercel.app', // Replace with your Vercel URL
  'https://your-frontend-domain.netlify.app', // If using Netlify
  'http://localhost:5173', // For local development with Vite
  'http://localhost:3000', // For local development with CRA
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, // If you are using cookies or sessions
}));



// Connect DB
connectDB();

// Middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);

// ---------------- ERROR HANDLER ----------------
const errorHandler = (err, req, res, next) => {
  console.error(`${err.name}: ${err.message}`);

  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // Invalid ObjectId
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID';
  }

  // Duplicate key
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `Duplicate value for ${field}`;
  }

  // Validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map(e => e.message)
      .join(', ');
  }

  res.status(statusCode).json({
    message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
  });
};

// Must be AFTER routes
app.use(errorHandler);

app.get('/', (req, res) => {
  res.send('Welcome to the E-commerce Backend API!');
});

// Start server
app.listen(PORT, () => {
  console.log(
    `Server is running on port ${PORT} in ${process.env.NODE_ENV} mode`
  );
});