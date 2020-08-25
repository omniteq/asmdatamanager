function requiredError(
  headerName: string,
  rowNumber: string,
  columnNumber: string
) {
  return `Pole ${headerName} jest wymagane w ${rowNumber} rzędzie / ${columnNumber} kolumnie`;
}

function headerError(headerName: string) {
  return `Kolumna ${headerName} jest wymagana`;
}

function uniqueError(headerName: string) {
  return `Wartości w kolumnie ${headerName} muszą być unikatowe`;
}

function validate(this: number, value: string) {
  if (value.length > this) {
    return false;
  }
  return true;
}

function validateError(
  headerName: string,
  rowNumber: string,
  columnNumber: string
) {
  return `Wartość w kolumnie ${headerName}, w rzędzie ${rowNumber} jest zbyt długa.`;
}

const pkConstrains = {
  required: true,
  unique: true,
  requiredError,
  headerError,
  uniqueError,
  validate: validate.bind(256),
  validateError,
};

const fkConstrains = {
  required: true,
  requiredError,
  headerError,
  validate: validate.bind(256),
  validateError,
};

const requiredConstrains = (maxLenght: number) => {
  return {
    required: true,
    requiredError,
    headerError,
    validate: validate.bind(maxLenght),
    validateError,
  };
};

const optionalDataConstrains = (maxLenght: number) => {
  return {
    headerError,
    validate: validate.bind(maxLenght),
    validateError,
  };
};

const optionalColumnConstrains = (maxLenght: number) => {
  return {
    optional: true,
    validate: validate.bind(maxLenght),
    validateError,
  };
};

const unusedConstrains = (maxLenght: number) => {
  return {
    optional: true,
    headerError,
  };
};

/* --- Apple School Manager --- */

const asmLocations = {
  headers: [
    {
      name: 'location_id',
      inputName: 'location_id',
      ...pkConstrains,
    },
    {
      name: 'location_name',
      inputName: 'location_name',
      ...requiredConstrains(256),
    },
  ],
};

const asmStudents = {
  headers: [
    {
      name: 'person_id',
      inputName: 'person_id',
      ...pkConstrains,
    },
    {
      name: 'person_number',
      inputName: 'person_number',
      ...optionalDataConstrains(64),
    },
    {
      name: 'first_name',
      inputName: 'first_name',
      ...requiredConstrains(32),
    },
    {
      name: 'middle_name',
      inputName: 'middle_name',
      ...optionalDataConstrains(32),
    },
    {
      name: 'last_name',
      inputName: 'last_name',
      ...requiredConstrains(64),
    },
    {
      name: 'grade_level',
      inputName: 'grade_level',
      ...optionalDataConstrains(64),
    },
    {
      name: 'email_address',
      inputName: 'email_address',
      ...optionalDataConstrains(256),
    },
    {
      name: 'sis_username',
      inputName: 'sis_username',
      ...optionalDataConstrains(256),
    },
    {
      name: 'password_policy',
      inputName: 'password_policy',
      headerError,
      validate: (value: string) => {
        if (['4', '6', '8'].indexOf(value) === -1 && value.length > 0) {
          return false;
        }
        return true;
      },
      validateError: (
        headerName: string,
        rowNumber: string,
        columnNumber: string
      ) => {
        return `Kolumna ${headerName} może zawierać wyłącznie wartości 4, 6, 8 lub być pusta. Niedozwolona wartość w rzędzie ${rowNumber}`;
      },
    },
    {
      name: 'location_id',
      inputName: 'location_id',
      ...fkConstrains,
    },
  ],
};

const asmStaff = {
  headers: [
    {
      name: 'person_id',
      inputName: 'person_id',
      ...pkConstrains,
    },
    {
      name: 'person_number',
      inputName: 'person_number',
      ...optionalDataConstrains(64),
    },
    {
      name: 'first_name',
      inputName: 'first_name',
      ...requiredConstrains(32),
    },
    {
      name: 'middle_name',
      inputName: 'middle_name',
      ...optionalDataConstrains(32),
    },
    {
      name: 'last_name',
      inputName: 'last_name',
      ...requiredConstrains(64),
    },
    {
      name: 'email_address',
      inputName: 'email_address',
      ...optionalDataConstrains(256),
    },
    {
      name: 'sis_username',
      inputName: 'sis_username',
      ...optionalDataConstrains(256),
    },
    {
      name: 'location_id',
      inputName: 'location_id',
      ...fkConstrains,
    },
  ],
};

const asmCourses = {
  headers: [
    {
      name: 'course_id',
      inputName: 'course_id',
      ...pkConstrains,
    },
    {
      name: 'course_number',
      inputName: 'course_number',
      ...optionalDataConstrains(64),
    },
    {
      name: 'course_name',
      inputName: 'course_name',
      ...optionalDataConstrains(128),
    },
    {
      name: 'location_id',
      inputName: 'location_id',
      ...fkConstrains,
    },
  ],
};

const asmClasses = {
  headers: [
    {
      name: 'class_id',
      inputName: 'class_id',
      ...pkConstrains,
    },
    {
      name: 'class_number',
      inputName: 'class_number',
      ...optionalDataConstrains(64),
    },
    {
      name: 'course_id',
      inputName: 'course_id',
      ...fkConstrains,
    },
    {
      name: 'instructor_id',
      inputName: 'instructor_id',
      ...optionalDataConstrains(256),
    },
    {
      name: 'instructor_id_2',
      inputName: 'instructor_id_2',
      ...optionalDataConstrains(256),
    },
    {
      name: 'instructor_id_3',
      inputName: 'instructor_id_3',
      ...optionalDataConstrains(256),
    },
    {
      name: 'location_id',
      inputName: 'location_id',
      ...fkConstrains,
    },
  ],
};

const asmRosters = {
  headers: [
    {
      name: 'roster_id',
      inputName: 'roster_id',
      ...pkConstrains,
    },
    {
      name: 'class_id',
      inputName: 'class_id',
      ...fkConstrains,
    },
    {
      name: 'student_id',
      inputName: 'student_id',
      ...fkConstrains,
    },
  ],
};

/* --- MS School Data Sync --- */

const msSchool = {
  headers: [
    {
      name: 'SIS ID',
      inputName: 'SIS ID',
      ...pkConstrains,
    },
    {
      name: 'Name',
      inputName: 'Name',
      ...requiredConstrains(256),
    },
  ],
};

const msStudent = {
  headers: [
    {
      name: 'SIS ID',
      inputName: 'SIS ID',
      ...pkConstrains,
    },
    {
      name: 'School SIS ID',
      inputName: 'School SIS ID',
      ...fkConstrains,
    },
    {
      name: 'Username',
      inputName: 'Username',
      ...optionalColumnConstrains(256),
    },
    {
      name: 'First Name',
      inputName: 'First Name',
      ...requiredConstrains(32),
    },
    {
      name: 'Last Name',
      inputName: 'Last Name',
      ...requiredConstrains(64),
    },
    {
      name: 'Middle Name',
      inputName: 'Middle Name',
      ...optionalColumnConstrains(32),
    },
    {
      name: 'Secondary Email',
      inputName: 'Secondary Email',
      ...optionalColumnConstrains(256),
    },
    {
      name: 'Student Number',
      inputName: 'Student Number',
      ...optionalColumnConstrains(64),
    },
    {
      name: 'Grade',
      inputName: 'Grade',
      ...optionalColumnConstrains(64),
    },
  ],
};

const msTeacher = {
  headers: [
    {
      name: 'SIS ID',
      inputName: 'SIS ID',
      ...pkConstrains,
    },
    {
      name: 'School SIS ID',
      inputName: 'School SIS ID',
      ...fkConstrains,
    },
    {
      name: 'Username',
      inputName: 'Username',
      ...optionalColumnConstrains(256),
    },
    {
      name: 'First Name',
      inputName: 'First Name',
      ...requiredConstrains(32),
    },
    {
      name: 'Last Name',
      inputName: 'Last Name',
      ...requiredConstrains(64),
    },
    {
      name: 'Middle Name',
      inputName: 'Middle Name',
      ...optionalColumnConstrains(32),
    },
    {
      name: 'Secondary Email',
      inputName: 'Secondary Email',
      ...optionalColumnConstrains(256),
    },
    {
      name: 'Teacher Number',
      inputName: 'Teacher Number',
      ...optionalColumnConstrains(64),
    },
    {
      name: 'Grade',
      inputName: 'Grade',
      ...optionalColumnConstrains(64),
    },
  ],
};

const msSection = {
  headers: [
    {
      name: 'SIS ID',
      inputName: 'SIS ID',
      ...pkConstrains,
    },
    {
      name: 'School SIS ID',
      inputName: 'School SIS ID',
      ...fkConstrains,
    },
    {
      name: 'Section Name',
      inputName: 'Section Name',
      ...requiredConstrains,
    },
    {
      name: 'Course SIS ID',
      inputName: 'Course SIS ID',
      ...optionalColumnConstrains(256),
    },
    {
      name: 'Course Name',
      inputName: 'Course Name',
      ...optionalColumnConstrains(128),
    },
    {
      name: 'Course Number',
      inputName: 'Course Number',
      ...optionalColumnConstrains(64),
    },
  ],
};

const msStudentEnrollment = {
  headers: [
    // {
    //   name: 'roster_id',
    //   inputName: 'roster_id',
    //   ...pkConstrains,
    // },
    {
      name: 'Section SIS ID',
      inputName: 'Section SIS ID',
      ...fkConstrains,
    },
    {
      name: 'SIS ID',
      inputName: 'SIS ID',
      ...fkConstrains,
    },
  ],
};

const msTeacherRoster = {
  headers: [
    {
      name: 'Section SIS ID',
      inputName: 'Section SIS ID',
      required: true,
      requiredError,
      headerError,
      validate: validate.bind(256),
      validateError,
    },
    {
      name: 'SIS ID',
      inputName: 'SIS ID',
      required: true,
      requiredError,
      headerError,
      validate: validate.bind(256),
      validateError,
    },
  ],
};

/* --- Common --- */

export default function getConfig(fileName: string) {
  switch (fileName.toLowerCase()) {
    case 'locations.csv':
      return asmLocations;
    case 'students.csv':
      return asmStudents;
    case 'staff.csv':
      return asmStaff;
    case 'courses.csv':
      return asmCourses;
    case 'classes.csv':
      return asmClasses;
    case 'rosters.csv':
      return asmRosters;
    case 'school.csv':
      return msSchool;
    case 'student.csv':
      return msStudent;
    case 'teacher.csv':
      return msTeacher;
    case 'section.csv':
      return msSection;
    case 'studentenrollment.csv':
      return msStudentEnrollment;
    case 'teacherroster.csv':
      return msTeacherRoster;
    default:
      return 0;
  }
}
