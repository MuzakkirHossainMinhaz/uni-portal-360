import { AcademicFacultySearchableFields } from './academicFaculty.constant';
import { TAcademicFaculty } from './academicFaculty.interface';
import { AcademicFacultyRepository } from './academicFaculty.repository';

const academicFacultyRepository = new AcademicFacultyRepository();

const createAcademicFacultyIntoDB = async (payload: TAcademicFaculty) => {
  const result = await academicFacultyRepository.create(payload);
  return result;
};

const getAllAcademicFacultiesFromDB = async (query: Record<string, unknown>) => {
  const { meta, data } = await academicFacultyRepository.findAll(
    query,
    AcademicFacultySearchableFields,
  );

  return { meta, result: data };
};

const getSingleAcademicFacultyFromDB = async (id: string) => {
  const result = await AcademicFaculty.findById(id);
  return result;
};

const updateAcademicFacultyIntoDB = async (id: string, payload: Partial<TAcademicFaculty>) => {
  const result = await AcademicFaculty.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  });
  return result;
};

export const AcademicFacultyServices = {
  createAcademicFacultyIntoDB,
  getAllAcademicFacultiesFromDB,
  getSingleAcademicFacultyFromDB,
  updateAcademicFacultyIntoDB,
};
