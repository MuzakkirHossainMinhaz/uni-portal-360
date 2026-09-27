import catchAsync from '../../utils/catchAsync';
import { TranscriptServices } from './transcript.service';
import AppError from '../../errors/AppError';

const generateTranscript = catchAsync(async (req, res) => {
  const userId = req.user.role === 'student' ? req.user.userId : req.query.studentId;
  if (typeof userId !== 'string' || !userId) throw new AppError(400, 'Student ID is required');
  const doc = await TranscriptServices.generateTranscript(userId);

  // Set response headers for PDF download
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=transcript-${userId}.pdf`);

  // Pipe PDF document to response
  doc.pipe(res);
  doc.end(); // Ensure the document stream is finalized
});

export const TranscriptControllers = {
  generateTranscript,
};
