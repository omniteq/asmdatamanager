import { FkValidationSchema } from './fkValidator';

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

const optionalColumnOptionalDataConstrains = (maxLenght: number) => {
  return {
    optional: true,
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
    {
      name: 'location_id_2',
      inputName: 'location_id_2',
      ...optionalColumnOptionalDataConstrains(256),
    },
    {
      name: 'location_id_3',
      inputName: 'location_id_3',
      ...optionalColumnOptionalDataConstrains(256),
    },
    {
      name: 'location_id_4',
      inputName: 'location_id_4',
      ...optionalColumnOptionalDataConstrains(256),
    },
    {
      name: 'location_id_5',
      inputName: 'location_id_5',
      ...optionalColumnOptionalDataConstrains(256),
    },
    {
      name: 'location_id_6',
      inputName: 'location_id_6',
      ...optionalColumnOptionalDataConstrains(256),
    },
    {
      name: 'location_id_7',
      inputName: 'location_id_7',
      ...optionalColumnOptionalDataConstrains(256),
    },
    {
      name: 'location_id_8',
      inputName: 'location_id_8',
      ...optionalColumnOptionalDataConstrains(256),
    },
    {
      name: 'location_id_9',
      inputName: 'location_id_9',
      ...optionalColumnOptionalDataConstrains(256),
    },
    {
      name: 'location_id_10',
      inputName: 'location_id_10',
      ...optionalColumnOptionalDataConstrains(256),
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
      ...optionalColumnOptionalDataConstrains(256),
    },
    {
      name: 'instructor_id_3',
      inputName: 'instructor_id_3',
      ...optionalColumnOptionalDataConstrains(256),
    },
    {
      name: 'instructor_id_4',
      inputName: 'instructor_id_4',
      ...optionalColumnOptionalDataConstrains(256),
    },
    {
      name: 'instructor_id_5',
      inputName: 'instructor_id_5',
      ...optionalColumnOptionalDataConstrains(256),
    },
    {
      name: 'instructor_id_6',
      inputName: 'instructor_id_6',
      ...optionalColumnOptionalDataConstrains(256),
    },
    {
      name: 'instructor_id_7',
      inputName: 'instructor_id_7',
      ...optionalColumnOptionalDataConstrains(256),
    },
    {
      name: 'instructor_id_8',
      inputName: 'instructor_id_8',
      ...optionalColumnOptionalDataConstrains(256),
    },
    {
      name: 'instructor_id_9',
      inputName: 'instructor_id_9',
      ...optionalColumnOptionalDataConstrains(256),
    },
    {
      name: 'instructor_id_10',
      inputName: 'instructor_id_10',
      ...optionalColumnOptionalDataConstrains(256),
    },
    {
      name: 'instructor_id_11',
      inputName: 'instructor_id_11',
      ...optionalColumnOptionalDataConstrains(256),
    },
    {
      name: 'instructor_id_12',
      inputName: 'instructor_id_12',
      ...optionalColumnOptionalDataConstrains(256),
    },
    {
      name: 'instructor_id_13',
      inputName: 'instructor_id_13',
      ...optionalColumnOptionalDataConstrains(256),
    },
    {
      name: 'instructor_id_14',
      inputName: 'instructor_id_14',
      ...optionalColumnOptionalDataConstrains(256),
    },
    {
      name: 'instructor_id_15',
      inputName: 'instructor_id_15',
      ...optionalColumnOptionalDataConstrains(256),
    },
    {
      name: 'instructor_id_16',
      inputName: 'instructor_id_16',
      ...optionalColumnOptionalDataConstrains(256),
    },
    {
      name: 'instructor_id_17',
      inputName: 'instructor_id_17',
      ...optionalColumnOptionalDataConstrains(256),
    },
    {
      name: 'instructor_id_18',
      inputName: 'instructor_id_18',
      ...optionalColumnOptionalDataConstrains(256),
    },
    {
      name: 'instructor_id_19',
      inputName: 'instructor_id_19',
      ...optionalColumnOptionalDataConstrains(256),
    },
    {
      name: 'instructor_id_20',
      inputName: 'instructor_id_20',
      ...optionalColumnOptionalDataConstrains(256),
    },
    {
      name: 'instructor_id_21',
      inputName: 'instructor_id_21',
      ...optionalColumnOptionalDataConstrains(256),
    },
    {
      name: 'instructor_id_22',
      inputName: 'instructor_id_22',
      ...optionalColumnOptionalDataConstrains(256),
    },
    {
      name: 'instructor_id_23',
      inputName: 'instructor_id_23',
      ...optionalColumnOptionalDataConstrains(256),
    },
    {
      name: 'instructor_id_24',
      inputName: 'instructor_id_24',
      ...optionalColumnOptionalDataConstrains(256),
    },
    {
      name: 'instructor_id_25',
      inputName: 'instructor_id_25',
      ...optionalColumnOptionalDataConstrains(256),
    },
    {
      name: 'instructor_id_26',
      inputName: 'instructor_id_26',
      ...optionalColumnOptionalDataConstrains(256),
    },
    {
      name: 'instructor_id_27',
      inputName: 'instructor_id_27',
      ...optionalColumnOptionalDataConstrains(256),
    },
    {
      name: 'instructor_id_28',
      inputName: 'instructor_id_28',
      ...optionalColumnOptionalDataConstrains(256),
    },
    {
      name: 'instructor_id_29',
      inputName: 'instructor_id_29',
      ...optionalColumnOptionalDataConstrains(256),
    },
    {
      name: 'instructor_id_30',
      inputName: 'instructor_id_30',
      ...optionalColumnOptionalDataConstrains(256),
    },
    {
      name: 'instructor_id_31',
      inputName: 'instructor_id_31',
      ...optionalColumnOptionalDataConstrains(256),
    },
    {
      name: 'instructor_id_32',
      inputName: 'instructor_id_32',
      ...optionalColumnOptionalDataConstrains(256),
    },
    {
      name: 'instructor_id_33',
      inputName: 'instructor_id_33',
      ...optionalColumnOptionalDataConstrains(256),
    },
    {
      name: 'instructor_id_34',
      inputName: 'instructor_id_34',
      ...optionalColumnOptionalDataConstrains(256),
    },
    {
      name: 'instructor_id_35',
      inputName: 'instructor_id_35',
      ...optionalColumnOptionalDataConstrains(256),
    },
    {
      name: 'instructor_id_36',
      inputName: 'instructor_id_36',
      ...optionalColumnOptionalDataConstrains(256),
    },
    {
      name: 'instructor_id_37',
      inputName: 'instructor_id_37',
      ...optionalColumnOptionalDataConstrains(256),
    },
    {
      name: 'instructor_id_38',
      inputName: 'instructor_id_38',
      ...optionalColumnOptionalDataConstrains(256),
    },
    {
      name: 'instructor_id_39',
      inputName: 'instructor_id_39',
      ...optionalColumnOptionalDataConstrains(256),
    },
    {
      name: 'instructor_id_40',
      inputName: 'instructor_id_40',
      ...optionalColumnOptionalDataConstrains(256),
    },
    {
      name: 'instructor_id_41',
      inputName: 'instructor_id_41',
      ...optionalColumnOptionalDataConstrains(256),
    },
    {
      name: 'instructor_id_42',
      inputName: 'instructor_id_42',
      ...optionalColumnOptionalDataConstrains(256),
    },
    {
      name: 'instructor_id_43',
      inputName: 'instructor_id_43',
      ...optionalColumnOptionalDataConstrains(256),
    },
    {
      name: 'instructor_id_44',
      inputName: 'instructor_id_44',
      ...optionalColumnOptionalDataConstrains(256),
    },
    {
      name: 'instructor_id_45',
      inputName: 'instructor_id_45',
      ...optionalColumnOptionalDataConstrains(256),
    },
    {
      name: 'instructor_id_46',
      inputName: 'instructor_id_46',
      ...optionalColumnOptionalDataConstrains(256),
    },
    {
      name: 'instructor_id_47',
      inputName: 'instructor_id_47',
      ...optionalColumnOptionalDataConstrains(256),
    },
    {
      name: 'instructor_id_48',
      inputName: 'instructor_id_48',
      ...optionalColumnOptionalDataConstrains(256),
    },
    {
      name: 'instructor_id_49',
      inputName: 'instructor_id_49',
      ...optionalColumnOptionalDataConstrains(256),
    },
    {
      name: 'instructor_id_50',
      inputName: 'instructor_id_50',
      ...optionalColumnOptionalDataConstrains(256),
    },
    {
      name: 'instructor_id_51',
      inputName: 'instructor_id_51',
      ...optionalColumnOptionalDataConstrains(256),
    },
    {
      name: 'instructor_id_52',
      inputName: 'instructor_id_52',
      ...optionalColumnOptionalDataConstrains(256),
    },
    {
      name: 'instructor_id_53',
      inputName: 'instructor_id_53',
      ...optionalColumnOptionalDataConstrains(256),
    },
    {
      name: 'instructor_id_54',
      inputName: 'instructor_id_54',
      ...optionalColumnOptionalDataConstrains(256),
    },
    {
      name: 'instructor_id_55',
      inputName: 'instructor_id_55',
      ...optionalColumnOptionalDataConstrains(256),
    },
    {
      name: 'instructor_id_26',
      inputName: 'instructor_id_26',
      ...optionalColumnOptionalDataConstrains(256),
    },
    {
      name: 'instructor_id_57',
      inputName: 'instructor_id_57',
      ...optionalColumnOptionalDataConstrains(256),
    },
    {
      name: 'instructor_id_58',
      inputName: 'instructor_id_58',
      ...optionalColumnOptionalDataConstrains(256),
    },
    {
      name: 'instructor_id_59',
      inputName: 'instructor_id_59',
      ...optionalColumnOptionalDataConstrains(256),
    },
    {
      name: 'instructor_id_60',
      inputName: 'instructor_id_60',
      ...optionalColumnOptionalDataConstrains(256),
    },
    {
      name: 'instructor_id_61',
      inputName: 'instructor_id_61',
      ...optionalColumnOptionalDataConstrains(256),
    },
    {
      name: 'instructor_id_62',
      inputName: 'instructor_id_62',
      ...optionalColumnOptionalDataConstrains(256),
    },
    {
      name: 'instructor_id_63',
      inputName: 'instructor_id_63',
      ...optionalColumnOptionalDataConstrains(256),
    },
    {
      name: 'instructor_id_64',
      inputName: 'instructor_id_64',
      ...optionalColumnOptionalDataConstrains(256),
    },
    {
      name: 'instructor_id_65',
      inputName: 'instructor_id_65',
      ...optionalColumnOptionalDataConstrains(256),
    },
    {
      name: 'instructor_id_66',
      inputName: 'instructor_id_66',
      ...optionalColumnOptionalDataConstrains(256),
    },
    {
      name: 'instructor_id_67',
      inputName: 'instructor_id_67',
      ...optionalColumnOptionalDataConstrains(256),
    },
    {
      name: 'instructor_id_68',
      inputName: 'instructor_id_68',
      ...optionalColumnOptionalDataConstrains(256),
    },
    {
      name: 'instructor_id_69',
      inputName: 'instructor_id_69',
      ...optionalColumnOptionalDataConstrains(256),
    },
    {
      name: 'instructor_id_70',
      inputName: 'instructor_id_70',
      ...optionalColumnOptionalDataConstrains(256),
    },
    {
      name: 'instructor_id_71',
      inputName: 'instructor_id_71',
      ...optionalColumnOptionalDataConstrains(256),
    },
    {
      name: 'instructor_id_72',
      inputName: 'instructor_id_72',
      ...optionalColumnOptionalDataConstrains(256),
    },
    {
      name: 'instructor_id_73',
      inputName: 'instructor_id_73',
      ...optionalColumnOptionalDataConstrains(256),
    },
    {
      name: 'instructor_id_74',
      inputName: 'instructor_id_74',
      ...optionalColumnOptionalDataConstrains(256),
    },
    {
      name: 'instructor_id_75',
      inputName: 'instructor_id_75',
      ...optionalColumnOptionalDataConstrains(256),
    },
    {
      name: 'instructor_id_76',
      inputName: 'instructor_id_76',
      ...optionalColumnOptionalDataConstrains(256),
    },
    {
      name: 'instructor_id_77',
      inputName: 'instructor_id_77',
      ...optionalColumnOptionalDataConstrains(256),
    },
    {
      name: 'instructor_id_78',
      inputName: 'instructor_id_78',
      ...optionalColumnOptionalDataConstrains(256),
    },
    {
      name: 'instructor_id_79',
      inputName: 'instructor_id_79',
      ...optionalColumnOptionalDataConstrains(256),
    },
    {
      name: 'instructor_id_80',
      inputName: 'instructor_id_80',
      ...optionalColumnOptionalDataConstrains(256),
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
      ...requiredConstrains(256),
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
      name: 'Section Number',
      inputName: 'Section Number',
      ...optionalColumnConstrains(256),
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

/* --- Foregin Key Validation --- */

export const fkValidationSchemaMs: FkValidationSchema = {
  student: [
    {
      fk: 'School SIS ID',
      fileName: 'school',
      pk: 'SIS ID',
    },
  ],
  section: [
    {
      fk: 'School SIS ID',
      fileName: 'school',
      pk: 'SIS ID',
    },
  ],
  studentenrollment: [
    {
      fk: 'SIS ID',
      fileName: 'student',
      pk: 'SIS ID',
    },
  ],
  teacher: [
    {
      fk: 'School SIS ID',
      fileName: 'school',
      pk: 'SIS ID',
    },
  ],
  teacherroster: [
    {
      fk: 'SIS ID',
      fileName: 'teacher',
      pk: 'SIS ID',
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
