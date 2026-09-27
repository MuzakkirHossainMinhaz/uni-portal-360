import AppError from '../errors/AppError';
import { AcademicDepartment } from '../modules/AcademicDepartment/academicDepartment.model';
import { Student } from '../modules/Student/student.model';
import { Faculty } from '../modules/Faculty/faculty.model';
import { OfferedCourse } from '../modules/OfferedCourse/offeredCourse.model';
import EnrolledCourse from '../modules/EnrolledCourse/enrolledCourse.model';
import { SemesterRegistration } from '../modules/SemesterRegistration/semesterRegistration.model';
import { SemesterResult } from '../modules/SemesterResult/semesterResult.model';
import { Fee } from '../modules/Fee/fee.model';

// Count historical references too; deleting a parent must not orphan archived records.
export const ensureAcademicRecordUnused = async (
  field: 'academicFaculty' | 'academicDepartment' | 'academicSemester',
  id: string,
) => {
  const references: PromiseLike<number>[] = [
    OfferedCourse.countDocuments({ [field]: id }),
    EnrolledCourse.countDocuments({ [field]: id }),
  ];
  if (field === 'academicFaculty')
    references.push(
      AcademicDepartment.countDocuments({ academicFaculty: id }),
      Student.countDocuments({ academicFaculty: id }),
    );
  if (field === 'academicDepartment')
    references.push(
      Faculty.countDocuments({ academicDepartment: id }),
      Student.countDocuments({ academicDepartment: id }),
    );
  if (field === 'academicSemester')
    references.push(
      Student.countDocuments({ admissionSemester: id }),
      SemesterRegistration.countDocuments({ academicSemester: id }),
      SemesterResult.countDocuments({ academicSemester: id }),
      Fee.countDocuments({ academicSemester: id }),
    );
  if ((await Promise.all(references)).some((count) => count > 0)) {
    throw new AppError(409, 'This academic record is in use and cannot be removed or reassigned');
  }
};
