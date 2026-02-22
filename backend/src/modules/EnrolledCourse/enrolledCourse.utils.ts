export const calculateGradeAndPoints = (totalMarks: number) => {
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
    return {
      grade: 'F',
      gradePoints: 0.0,
    };
  }

  if (totalMarks >= 40 && totalMarks <= 49) {
    return {
      grade: 'D',
      gradePoints: 2.0,
    };
  }

  if (totalMarks >= 50 && totalMarks <= 54) {
    return {
      grade: 'C',
      gradePoints: 2.5,
    };
  }

  if (totalMarks >= 55 && totalMarks <= 59) {
    return {
      grade: 'C+',
      gradePoints: 2.75,
    };
  }

  if (totalMarks >= 60 && totalMarks <= 64) {
    return {
      grade: 'B',
      gradePoints: 3.0,
    };
  }

  if (totalMarks >= 65 && totalMarks <= 69) {
    return {
      grade: 'B+',
      gradePoints: 3.5,
    };
  }

  if (totalMarks >= 70 && totalMarks <= 79) {
    return {
      grade: 'A',
      gradePoints: 3.75,
    };
  }

  if (totalMarks >= 80 && totalMarks <= 100) {
    return {
      grade: 'A+',
      gradePoints: 4.0,
    };
  }

  return {
    grade: 'NA',
    gradePoints: 0,
  };
};
