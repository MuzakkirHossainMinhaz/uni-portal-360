import { Course } from '../Course/course.model';
import { Student } from '../Student/student.model';
import { User } from '../User/user.model';

const getDashboardStats = async () => {
  const totalStudents = await Student.countDocuments();
  const totalCourses = await Course.countDocuments();

  return {
    totalStudents,
    totalCourses,
  };
};

const getEnrollmentTrends = async (query: Record<string, unknown>) => {
  const { period = 'last6months' } = query;
  
  let startDate = new Date();
  let groupByFormat = '%Y-%m-%d';

  if (period === 'last7days') {
      startDate.setDate(startDate.getDate() - 7);
      groupByFormat = '%Y-%m-%d';
  } else if (period === 'last30days') {
      startDate.setDate(startDate.getDate() - 30);
      groupByFormat = '%Y-%m-%d';
  } else if (period === 'last6months') {
      startDate.setMonth(startDate.getMonth() - 6);
      groupByFormat = '%Y-%m';
  } else if (period === 'custom' && query.startDate && query.endDate) {
      startDate = new Date(query.startDate as string);
      // Logic for custom range grouping could be more dynamic
  }

  const stats = await User.aggregate([
      {
          $match: {
              role: 'student',
              createdAt: { $gte: startDate },
          },
      },
      {
          $group: {
              _id: {
                  $dateToString: { format: groupByFormat, date: '$createdAt' },
              },
              count: { $sum: 1 },
          },
      },
      {
          $sort: { _id: 1 },
      },
  ]);

  return stats;
};

export const AnalyticsServices = {
  getDashboardStats,
  getEnrollmentTrends,
};
