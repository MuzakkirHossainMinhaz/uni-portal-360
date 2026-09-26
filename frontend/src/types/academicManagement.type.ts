export type TAcademicSemester = {
  _id: string;
  name: string;
  year: string;
  code: string;
  startMonth: string;
  endMonth: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
};

export type TAcademicFaculty = {
  _id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
};

export type TAcademicDepartment = {
  _id: string;
  name: string;
  description?: string;
  academicFaculty: TAcademicFaculty | null;
  createdAt: string;
  updatedAt: string;
};
