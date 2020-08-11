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

const optionalConstrains = (maxLenght: number) => {
  return {
    headerError,
    validate: validate.bind(maxLenght),
    validateError,
  };
};

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
      ...optionalConstrains(64),
    },
    {
      name: 'first_name',
      inputName: 'first_name',
      ...requiredConstrains(32),
    },
    {
      name: 'middle_name',
      inputName: 'middle_name',
      ...optionalConstrains(32),
    },
    {
      name: 'last_name',
      inputName: 'last_name',
      ...requiredConstrains(64),
    },
    {
      name: 'grade_level',
      inputName: 'grade_level',
      ...optionalConstrains(64),
    },
    {
      name: 'email_address',
      inputName: 'email_address',
      ...optionalConstrains(256),
    },
    {
      name: 'sis_username',
      inputName: 'sis_username',
      ...optionalConstrains(256),
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
      ...optionalConstrains(64),
    },
    {
      name: 'first_name',
      inputName: 'first_name',
      ...requiredConstrains(32),
    },
    {
      name: 'middle_name',
      inputName: 'middle_name',
      ...optionalConstrains(32),
    },
    {
      name: 'last_name',
      inputName: 'last_name',
      ...requiredConstrains(64),
    },
    {
      name: 'email_address',
      inputName: 'email_address',
      ...optionalConstrains(256),
    },
    {
      name: 'sis_username',
      inputName: 'sis_username',
      ...optionalConstrains(256),
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
      ...optionalConstrains(64),
    },
    {
      name: 'course_name',
      inputName: 'course_name',
      ...optionalConstrains(128),
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
      ...optionalConstrains(64),
    },
    {
      name: 'course_id',
      inputName: 'course_id',
      ...fkConstrains,
    },
    {
      name: 'instructor_id',
      inputName: 'instructor_id',
      ...optionalConstrains(256),
    },
    {
      name: 'instructor_id_2',
      inputName: 'instructor_id_2',
      ...optionalConstrains(256),
    },
    {
      name: 'instructor_id_3',
      inputName: 'instructor_id_2',
      ...optionalConstrains(256),
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
    default:
      return 0;
  }
}
