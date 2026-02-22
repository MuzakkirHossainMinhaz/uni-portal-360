import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../User/user.constant';
import { TranscriptControllers } from './transcript.controller';

const router = express.Router();

/**
 * @openapi
 * /transcript:
 *   get:
 *     summary: Download academic transcript (PDF)
 *     tags: [Transcript]
 *     responses:
 *       200:
 *         description: PDF file stream
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get(
  '/',
  auth(USER_ROLE.student, USER_ROLE.admin, USER_ROLE.superAdmin),
  TranscriptControllers.generateTranscript,
);

export const TranscriptRoutes = router;
