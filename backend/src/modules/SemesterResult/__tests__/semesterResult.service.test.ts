import mongoose from 'mongoose';
import { SemesterResultServices } from '../semesterResult.service';
import EnrolledCourse from '../../EnrolledCourse/enrolledCourse.model';
import { SemesterResult } from '../semesterResult.model';
import { Student } from '../../Student/student.model';

// Mock dependencies
jest.mock('../../EnrolledCourse/enrolledCourse.model');
jest.mock('../semesterResult.model');
jest.mock('../../Student/student.model');

describe('SemesterResultServices', () => {
  describe('calculateSemesterGPA', () => {
    const mockStudentId = new mongoose.Types.ObjectId().toString();
    const mockSemesterId = new mongoose.Types.ObjectId().toString();

    const mockEnrolledCourses = [
      {
        _id: new mongoose.Types.ObjectId(),
        course: { credits: 3 },
        gradePoints: 4.0, // A+
      },
      {
        _id: new mongoose.Types.ObjectId(),
        course: { credits: 3 },
        gradePoints: 3.0, // B
      },
    ];

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should calculate GPA correctly', async () => {
      // Mock EnrolledCourse.find
      (EnrolledCourse.find as jest.Mock).mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockEnrolledCourses),
      });

      // Mock SemesterResult.findOneAndUpdate
      (SemesterResult.findOneAndUpdate as jest.Mock).mockResolvedValue({
        student: mockStudentId,
        academicSemester: mockSemesterId,
        totalCredits: 6,
        totalGradePoints: 21,
        gpa: 3.5,
      });

      // Mock SemesterResult.find for CGPA
      (SemesterResult.find as jest.Mock).mockReturnValue({
        session: jest.fn().mockResolvedValue([
          { totalCredits: 6, totalGradePoints: 21 },
        ]),
      });

      // Mock Student.findByIdAndUpdate
      (Student.findByIdAndUpdate as jest.Mock).mockResolvedValue({});

      // Mock mongoose session
      const mockSession: {
        startTransaction: jest.Mock;
        commitTransaction: jest.Mock;
        abortTransaction: jest.Mock;
        endSession: jest.Mock;
      } = {
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        abortTransaction: jest.fn(),
        endSession: jest.fn(),
      };
      jest
        .spyOn(mongoose, 'startSession')
        .mockResolvedValue(mockSession as unknown as mongoose.ClientSession);

      const result = await SemesterResultServices.calculateSemesterGPA(
        mockStudentId,
        mockSemesterId
      );

      // Assertions
      expect(result.gpa).toBe(3.5); // (12 + 9) / 6 = 3.5
      expect(EnrolledCourse.find).toHaveBeenCalledWith({
        student: mockStudentId,
        academicSemester: mockSemesterId,
        isCompleted: true,
      });
      expect(SemesterResult.findOneAndUpdate).toHaveBeenCalled();
      expect(Student.findByIdAndUpdate).toHaveBeenCalledWith(
        mockStudentId,
        { cgpa: 3.5 },
        expect.anything()
      );
    });
  });
});
