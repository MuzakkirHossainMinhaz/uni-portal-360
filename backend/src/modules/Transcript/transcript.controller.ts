import catchAsync from '../../utils/catchAsync';
import { TranscriptServices } from './transcript.service';

const generateTranscript = catchAsync(async (req, res) => {
  const { userId } = req.user;
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
