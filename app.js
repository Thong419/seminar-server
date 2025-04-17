// package
import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';

// utils
import AppError from './utils/AppError.js';
import GlobalErrorHandler from './controllers/errorController.js';

// routers
import csrRoutes from './routers/csrRoutes.js';
import userCARoutes from './routers/userCARoutes.js';


dotenv.config();

const app = express();

//Dev log
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));
if (process.env.NODE_ENV === 'production') console.log('Working in Production');

// Cookie
app.use(cookieParser());

//cors
const corsOrigin = {
  origin: process.env.CORS_ALLOW_ORIGINS
  ? process.env.CORS_ALLOW_ORIGINS.split(',')
  : ['http://localhost:5173'], //or whatever port your frontend is using
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOrigin));

// Helmet for security headers
app.use(helmet({
  contentSecurityPolicy: false,
}));

// Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Data sanitization
app.use(mongoSanitize());
app.use(xss());

//prevent parameter pollution
app.use(
  hpp({
    whitelist: [],
  })
);

// Timestamp middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// Routes
app.use('/api/csr', csrRoutes);
app.use('/api/users', userCARoutes);


// Global error handler
app.all('*', (req, res, next) => {
  next(new AppError(404, `Can't find ${req.originalUrl} on this server`));
});
// Global error handler
app.use(GlobalErrorHandler);

export default app;
