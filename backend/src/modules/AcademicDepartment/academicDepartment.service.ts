import { TPaginatedResult } from '../../shared/baseRepository';
import { BaseService } from '../../shared/baseService';
import { AcademicDepartmentSearchableFields } from './academicDepartment.constant';
import { TAcademicDepartment } from './academicDepartment.interface';
import { AcademicDepartment } from './academicDepartment.model';
import { AcademicDepartmentRepository } from './academicDepartment.repository';

const academicDepartmentRepository = new AcademicDepartmentRepository();

class AcademicDepartmentService extends BaseService<
  TAcademicDepartment,
  TAcademicDepartment,
  Partial<TAcademicDepartment>
> {
  constructor() {
    super(academicDepartmentRepository);
  }

  async getAll(
    query: Record<string, unknown>,
    searchableFields?: string[],
  ): Promise<TPaginatedResult<TAcademicDepartment>> {
    const result = await super.getAll(query, searchableFields);
    // Populate academicFaculty for all results
    if (result.data && Array.isArray(result.data)) {
      const populatedData = await Promise.all(
        result.data.map(async (item: any) => {
          const populatedItem = await AcademicDepartment.findById(item._id).populate('academicFaculty');
          return populatedItem;
        }),
      );
      // Filter out null values and cast to proper type
      return {
        ...result,
        data: populatedData.filter((item): item is NonNullable<typeof item> => item !== null) as TAcademicDepartment[],
      };
    }
    return result;
  }

  async getById(id: string) {
    const result = await AcademicDepartment.findById(id).populate('academicFaculty');
    return result;
  }
}

const academicDepartmentService = new AcademicDepartmentService();

export const AcademicDepartmentServices = {
  createAcademicDepartmentIntoDB: (payload: TAcademicDepartment) => academicDepartmentService.create(payload),
  getAllAcademicDepartmentsFromDB: (query: Record<string, unknown>) =>
    academicDepartmentService.getAll(query, AcademicDepartmentSearchableFields),
  getSingleAcademicDepartmentFromDB: (id: string) => academicDepartmentService.getById(id),
  updateAcademicDepartmentIntoDB: (id: string, payload: Partial<TAcademicDepartment>) =>
    academicDepartmentService.updateById(id, payload),
  deleteAcademicDepartmentFromDB: (id: string) => academicDepartmentService.deleteById(id),
};
