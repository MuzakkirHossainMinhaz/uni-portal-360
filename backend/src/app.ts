import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Application, Request, Response } from 'express';
// import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import hpp from 'hpp';
import swaggerUi from 'swagger-ui-express';
import config from './config';
import globalErrorHandler from './middlewares/globalErrorhandler';
import notFound from './middlewares/notFound';
import router from './routes';
import swaggerSpec from './shared/swagger';

const app: Application = express();

// Security Middlewares
app.use(helmet());
// app.use(mongoSanitize());
app.use(hpp());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: 'Too many requests from this IP, please try again after 15 minutes',
});
app.use(limiter);

// Parsers
app.use(express.json());
app.use(cookieParser());

const isProduction = config.NODE_ENV === 'PRODUCTION' || config.NODE_ENV === 'production';
app.use(
  cors({
    origin: isProduction ? (config.cors_origin as string) : true,
    credentials: true,
  }),
);

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Application Routes
app.use('/api/v1', router);

app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Uni Portal 360 backend is running successfully.',
  });
});

// Global Error Handler
app.use(globalErrorHandler);

//Not Found
app.use(notFound);

export default app;
