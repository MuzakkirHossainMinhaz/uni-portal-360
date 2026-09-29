import cookieParser from 'cookie-parser';
import cors from 'cors';
import type { Application, Request, Response } from 'express';
import express from 'express';
import mongoose from 'mongoose';
// import mongoSanitize from 'express-mongo-sanitize';
import helmet from 'helmet';
import hpp from 'hpp';
import swaggerUi from 'swagger-ui-express';
import config from './config';
import { auditLogger } from './middlewares/auditLogger';
import globalErrorHandler from './middlewares/globalErrorHandler';
import notFound from './middlewares/notFound';
import router from './routes';
import swaggerSpec from './shared/swagger';

const app: Application = express();
const trustProxyHops = Number(process.env.TRUST_PROXY_HOPS ?? 0);
if (!Number.isInteger(trustProxyHops) || trustProxyHops < 0 || trustProxyHops > 3) {
  throw new Error('TRUST_PROXY_HOPS must be an integer from 0 to 3');
}
app.set('trust proxy', trustProxyHops);

// Security Middlewares
app.use(helmet());
// app.use(mongoSanitize());
app.use(hpp());

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
app.use('/api/v1', auditLogger);
app.use('/api/v1', router);

app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Uni Portal 360 backend is running successfully.',
  });
});

app.get('/health', (_req: Request, res: Response) => {
  const ready = mongoose.connection.readyState === 1;
  res.status(ready ? 200 : 503).json({ ready });
});

// Global Error Handler
app.use(globalErrorHandler);

//Not Found
app.use(notFound);

export default app;
