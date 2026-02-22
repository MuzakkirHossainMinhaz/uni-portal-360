import httpStatus from 'http-status';
import PDFDocument from 'pdfkit';
import AppError from '../../errors/AppError';
import { SemesterResult } from '../SemesterResult/semesterResult.model';
import { Student } from '../Student/student.model';

const generateTranscript = async (studentId: string): Promise<PDFKit.PDFDocument> => {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });

  // Generate content asynchronously
  await generateTranscriptContent(doc, studentId);

  return doc;
};

const generateTranscriptContent = async (doc: PDFKit.PDFDocument, studentId: string) => {
    // 1. Fetch Student Data
  const student = await Student.findOne({ id: studentId })
    .populate('admissionSemester')
    .populate('academicDepartment')
    .populate('academicFaculty');

  if (!student) {
    throw new AppError(httpStatus.NOT_FOUND, 'Student not found');
  }

  // 2. Fetch Academic History (Semester Results)
  const semesterResults = await SemesterResult.find({ student: student._id })
    .populate('academicSemester')
    .populate({
      path: 'completedCourses',
      populate: {
        path: 'course',
      },
    })
    .sort({ 'academicSemester.year': 1, 'academicSemester.startMonth': 1 }); // Sort chronologically

  if (!semesterResults.length) {
    throw new AppError(httpStatus.NOT_FOUND, 'No academic records found for this student');
  }
  
  // --- Header ---
  doc
    .fontSize(20)
    .text('OFFICIAL ACADEMIC TRANSCRIPT', { align: 'center', underline: true })
    .moveDown();

  doc
    .fontSize(12)
    .text(`Student Name: ${student.fullName}`)
    .text(`Student ID: ${student.id}`)
    .text(`Department: ${(student.academicDepartment as any)?.title}`)
    .text(`Faculty: ${(student.academicFaculty as any)?.title}`)
    .text(`Date Issued: ${new Date().toLocaleDateString()}`)
    .moveDown();

  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke().moveDown();

  // --- Semester Results ---
  for (const result of semesterResults) {
    const semesterName = `${(result.academicSemester as any).name} ${(result.academicSemester as any).year}`;
    
    // Semester Header
    doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .text(semesterName)
      .font('Helvetica')
      .fontSize(10);

    // Table Header
    const tableTop = doc.y + 10;
    const col1 = 50; // Code
    const col2 = 150; // Title
    const col3 = 400; // Credits
    const col4 = 450; // GradePoints
    const col5 = 500; // Grade

    doc
      .text('Course Code', col1, tableTop, { underline: true })
      .text('Course Title', col2, tableTop, { underline: true })
      .text('Credits', col3, tableTop, { underline: true })
      .text('Points', col4, tableTop, { underline: true })
      .text('Grade', col5, tableTop, { underline: true });

    let yPosition = tableTop + 20;

    // Courses List
    for (const enrolledCourse of (result.completedCourses as any[])) {
       // Check for page break
       if (yPosition > 700) {
           doc.addPage();
           yPosition = 50;
       }

       const courseDetails = enrolledCourse.course;
       
       doc
        .text(courseDetails.code || 'N/A', col1, yPosition)
        .text(courseDetails.title.substring(0, 45) || 'N/A', col2, yPosition)
        .text(courseDetails.credits.toString(), col3, yPosition)
        .text(enrolledCourse.gradePoints.toString(), col4, yPosition)
        .text(enrolledCourse.grade, col5, yPosition);

       yPosition += 15;
    }
    
    // Semester Summary
    yPosition += 10;
    doc
        .font('Helvetica-Bold')
        .text(`Semester GPA: ${result.gpa.toFixed(2)}`, col1, yPosition)
        .text(`Credits: ${result.totalCredits}`, col3, yPosition)
        .font('Helvetica')
        .moveDown(2);
        
    doc.y = yPosition + 30; // Update cursor for next loop
  }

  // --- Final Summary ---
  doc.moveDown();
  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke().moveDown();
  
  doc
    .fontSize(14)
    .font('Helvetica-Bold')
    .text(`Cumulative GPA (CGPA): ${student.cgpa?.toFixed(2) || 'N/A'}`, { align: 'right' });

  doc
    .fontSize(10)
    .font('Helvetica')
    .moveDown(2)
    .text('This is a computer-generated document. No signature is required.', { align: 'center', color: 'gray' });
};

export const TranscriptServices = {
  generateTranscript,
  generateTranscriptContent
};
