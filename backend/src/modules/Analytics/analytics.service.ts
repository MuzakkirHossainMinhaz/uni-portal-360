import { Course } from '../Course/course.model';
import { Student } from '../Student/student.model';
import { User } from '../User/user.model';
import { Faculty } from '../Faculty/faculty.model';
import EnrolledCourse from '../EnrolledCourse/enrolledCourse.model';

const getDashboardStats = async () => {
  const totalStudents = await Student.countDocuments();
  const totalCourses = await Course.countDocuments();
  const totalFaculty = await Faculty.countDocuments();
  const totalEnrollments = await EnrolledCourse.countDocuments();

  return {
    totalStudents,
    totalCourses,
    totalFaculty,
    totalEnrollments,
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

const getPassRateAnalytics = async () => {
    // Pass rate: (Total Passed / Total Completed) * 100
    // We consider 'isCompleted: true' for completed courses.
    // Passed means grade != 'F'
    
    const stats = await EnrolledCourse.aggregate([
        {
            $match: {
                isCompleted: true,
            },
        },
        {
            $group: {
                _id: null,
                totalCompleted: { $sum: 1 },
                totalPassed: {
                    $sum: {
                        $cond: [{ $ne: ['$grade', 'F'] }, 1, 0],
                    },
                },
            },
        },
        {
            $project: {
                _id: 0,
                totalCompleted: 1,
                totalPassed: 1,
                passRate: {
                    $multiply: [{ $divide: ['$totalPassed', '$totalCompleted'] }, 100],
                },
            },
        },
    ]);

    return stats[0] || { totalCompleted: 0, totalPassed: 0, passRate: 0 };
};

export const AnalyticsServices = {
  getDashboardStats,
  getEnrollmentTrends,
  getPassRateAnalytics,
};
