export const calculateGradeAndPoints = (totalMarks: number) => {
  let result = {
    grade: 'NA',
    gradePoints: 0,
  };

  /**
   * 0-39 F
   * 40-49 D
   * 50-54 C
   * 55-59 C+
   * 60-64 B
   * 65-69 B+
   * 70-79 A
   * 80-100 A+
   */
  if (totalMarks >= 0 && totalMarks <= 39) {
    result = {
      grade: 'F',
      gradePoints: 0.0,
    };
  } else if (totalMarks >= 40 && totalMarks <= 49) {
    result = {
      grade: 'D',
      gradePoints: 2.0,
    };
  } else if (totalMarks >= 50 && totalMarks <= 54) {
    result = {
      grade: 'C',
      gradePoints: 2.5,
    };
  } else if (totalMarks >= 55 && totalMarks <= 59) {
    result = {
      grade: 'C+',
      gradePoints: 2.75,
    };
  } else if (totalMarks >= 60 && totalMarks <= 64) {
    result = {
      grade: 'B',
      gradePoints: 3.0,
    };
  } else if (totalMarks >= 65 && totalMarks <= 69) {
    result = {
      grade: 'B+',
      gradePoints: 3.5,
    };
  } else if (totalMarks >= 70 && totalMarks <= 79) {
    result = {
      grade: 'A',
      gradePoints: 3.75,
    };
  } else if (totalMarks >= 80 && totalMarks <= 100) {
    result = {
      grade: 'A+',
      gradePoints: 4.0,
    };
  } else {
    result = {
      grade: 'NA',
      gradePoints: 0,
    };
  }

  return result;
};

