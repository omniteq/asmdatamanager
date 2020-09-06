/* eslint-disable no-underscore-dangle */
/* eslint no-underscore-dangle: "error" */
import {
  FilesDataMS,
  FilesDataASM,
  AsmLocation,
  AsmClass,
  AsmCourse,
  AsmRoster,
  AsmStaff,
  AsmStudent,
  MsStudentEnrollement,
  MsTeacherRoster,
  MsSchool,
  MsStudent,
  MsTeacher,
  MsSection,
  MsFile,
} from 'files';
import { FilesASM, Options } from '../converter';
import findObjectByProperty from './utils';

function generateProperties(
  name: string,
  rangeFrom: number,
  rangeTo: number,
  valueParam: { indexModificator: number; arg?: any },
  getValueFunction: (arg: any, index: number) => any
) {
  const object: any = {};
  for (let i = rangeFrom; i < rangeTo + 1; i += 1) {
    object[name + i] = getValueFunction(
      valueParam.arg,
      i + valueParam.indexModificator
    );
  }
  return object;
}

function removeEmptyColumns(array: any[], fieldNamePattern: string) {
  // remove unnecessary instructor fields
  let maxInstructor: number;
  for (let i = 4; i < 51; i += 1) {
    const nthValues = array.filter((item) => {
      return (
        item[`${fieldNamePattern}${i.toString()}`] &&
        item[`${fieldNamePattern}${i.toString()}`]!.length > 0
      );
    });
    if (nthValues && nthValues.length < 1) {
      maxInstructor = i - 1;
      break;
    }
  }
  array.forEach((item) => {
    for (let i = maxInstructor + 1; i < 51; i += 1) {
      delete item[`instructor_id_${i.toString()}`];
    }
  });
}

export default class Converter {
  data: FilesDataMS;

  options?: Options;

  _template: FilesASM;

  _Shool: MsSchool[];

  _Student: MsStudent[];

  _Teacher: MsTeacher[];

  _Section: MsSection[];

  _TeacherRoster: MsTeacherRoster[];

  _StudentEnrollment: MsStudentEnrollement[];

  _templateLocations: AsmLocation[];

  _templateStudents: AsmStudent[];

  _templateStaff: AsmStaff[];

  _templateCourses: AsmCourse[];

  _templateClasses: AsmClass[];

  _templateRosters: AsmRoster[];

  constructor(data: FilesDataMS, options?: Options) {
    this.data = data;
    this.options = options;
    this._template = [
      {
        locations: {
          inValidMessages: [],
          data: [] as AsmLocation[],
        },
      },
      {
        students: {
          inValidMessages: [],
          data: [] as AsmStudent[],
        },
      },
      { staff: { inValidMessages: [], data: [] as AsmStaff[] } },
      {
        courses: {
          inValidMessages: [],
          data: [] as AsmCourse[],
        },
      },
      {
        classes: { inValidMessages: [], data: [] as AsmClass[] },
      },
      {
        rosters: {
          inValidMessages: [],
          data: [] as AsmRoster[],
        },
      },
    ];
    this._templateLocations = this._template[0].locations.data;
    this._templateStudents = this._template[1].students.data;
    this._templateStaff = this._template[2].staff.data;
    this._templateCourses = this._template[3].courses.data;
    this._templateClasses = this._template[4].classes.data;
    this._templateRosters = this._template[5].rosters.data;
    this._Shool = this.data[findObjectByProperty(data, 'school')].school!
      .data! as MsSchool[];
    this._Student = this.data[findObjectByProperty(data, 'student')].student!
      .data! as MsStudent[];
    this._Teacher = this.data[findObjectByProperty(data, 'teacher')].teacher!
      .data! as MsTeacher[];
    this._Section = this.data[findObjectByProperty(data, 'section')].section!
      .data! as MsSection[];
    this._TeacherRoster = this.data[findObjectByProperty(data, 'teacherroster')]
      .teacherroster!.data! as MsTeacherRoster[];
    this._StudentEnrollment = this.data[
      findObjectByProperty(data, 'studentenrollment')
    ].studentenrollment!.data! as MsStudentEnrollement[];
  }

  // get all instructors for Course SIS ID and return nth
  private _getInstructorSisId = (
    sectionSisId: string,
    index: number
  ): string | '' => {
    const instructors = this._TeacherRoster.filter((x) => {
      const row = x as MsTeacherRoster;
      return row['Section SIS ID'] === sectionSisId;
    });
    if (instructors[index] !== undefined) {
      return instructors[index]['SIS ID'];
    }
    return '';
  };

  private _buildLocations() {
    this._Shool.forEach((x, i) => {
      const row = x as MsSchool;
      this._templateLocations.push({
        location_id: row['SIS ID'] ? row['SIS ID'] : '',
        location_name: row.Name ? row.Name : '',
      });
    });
  }

  private _buildStudents() {
    this._Student.forEach((x) => {
      const row = x as MsStudent;
      this._templateStudents.push({
        person_id: row['SIS ID'] ? row['SIS ID'] : '',
        person_number: row['Student Number'] ? row['Student Number'] : '',
        first_name: row['First Name'] ? row['First Name'] : '',
        middle_name: row['Middle Name'] ? row['Middle Name'] : '',
        last_name: row['Last Name'] ? row['Last Name'] : '',
        grade_level: row.Grade ? row.Grade : '',
        email_address: row['Secondary Email'] ? row['Secondary Email'] : '',
        sis_username: row.Username ? row.Username : '',
        password_policy: '',
        location_id: row['School SIS ID'] ? row['School SIS ID'] : '',
      });
    });
  }

  private _buildStaff() {
    this._Teacher.forEach((x) => {
      const row = x as MsTeacher;
      this._templateStaff.push({
        person_id: row['SIS ID'] ? row['SIS ID'] : '',
        person_number: row['Teacher Number'] ? row['Teacher Number'] : '',
        first_name: row['First Name'] ? row['First Name'] : '',
        middle_name: row['Middle Name'] ? row['Middle Name'] : '',
        last_name: row['Last Name'] ? row['Last Name'] : '',
        email_address: row['Secondary Email'] ? row['Secondary Email'] : '',
        sis_username: row.Username ? row.Username : '',
        location_id: row['School SIS ID'] ? row['School SIS ID'] : '',
      });
    });
  }

  private _buildCourses() {
    this._Section.forEach((x, i) => {
      const row = x as MsSection;

      if (row['Course SIS ID'] && row['Course SIS ID'].length > 0) {
        const courseExsits = this._templateCourses.findIndex(
          (item) => item.course_id === row['Course SIS ID']
        );
        if (courseExsits && courseExsits > 0) {
          return;
        }
      }

      this._templateCourses.push({
        course_id:
          (row['Course SIS ID'] !== undefined &&
            row['Course SIS ID']!.length > 0) ||
          i === 0
            ? row['Course SIS ID']
            : (1000 + i).toString(),
        course_number:
          (row['Course Number'] !== undefined &&
            row['Course Number']!.length > 0) ||
          i === 0
            ? row['Course Number']
            : (1000 + i).toString(),
        course_name:
          (row['Course Name'] !== undefined &&
            row['Course Name']!.length > 0) ||
          i === 0
            ? row['Course Name']
            : row['Section Name'],
        location_id: row['School SIS ID'] ? row['School SIS ID'] : '',
      });
    });
  }

  private _buildClasses() {
    this._Section.forEach((x, i) => {
      const row = x as MsSection;
      if (Object.entries(row).length === 0) {
        this._templateClasses.push({} as AsmClass);
      } else {
        this._templateClasses.push({
          class_id: row['SIS ID'] ? row['SIS ID'] : '',
          class_number: row['Section Number'] ? row['Section Number'] : '',
          course_id:
            (row['Course SIS ID'] !== undefined &&
              row['Course SIS ID']!.length > 0) ||
            i === 0
              ? row['Course SIS ID']
              : (1000 + i).toString(),
          instructor_id: this._getInstructorSisId(row['SIS ID'], 0),
          ...generateProperties(
            'instructor_id_',
            2,
            50,
            { indexModificator: -1, arg: row['SIS ID'] },
            this._getInstructorSisId
          ),
          location_id: row['School SIS ID'] ? row['School SIS ID'] : '',
        });
      }
    });
  }

  private _buildRosters() {
    this._StudentEnrollment.forEach((x, i) => {
      const row = x as MsStudentEnrollement;
      this._templateRosters.push({
        roster_id: i.toString(),
        class_id: row['Section SIS ID'] ? row['Section SIS ID'] : '',
        student_id: row['SIS ID'] ? row['SIS ID'] : '',
      });
    });
  }

  private _buildMargedClasses() {
    if (
      this.options &&
      this.options.classYear &&
      this.options.classNumberColumnName
    ) {
      const { classNumberColumnName, classYear } = this.options;
      this._Section.forEach((x, i) => {
        const row = x as MsSection;

        if (Object.entries(row).length === 0) {
          this._templateClasses.push({} as AsmClass);
        } else {
          // TODO: parsing value according to the user-defined schema
          const classId = `${row['School SIS ID']}_${row[classNumberColumnName]}_${classYear}`;

          // check if class exists
          let classIndex = this._templateClasses.findIndex((element) => {
            return element.class_id === classId;
          });

          // if class doesn't exist, create one
          if (classIndex === -1) {
            classIndex =
              this._templateClasses.push({
                class_id: classId,
                location_id: row['School SIS ID'],
                class_number: row[classNumberColumnName],
                course_id:
                  (row['Course SIS ID'] !== undefined &&
                    row['Course SIS ID']!.length > 0) ||
                  i === 0
                    ? row['Course SIS ID']
                    : (1000 + i).toString(),
              }) - 1;
          }

          // enroll students to a new artficial class
          this._templateRosters.push({} as AsmRoster);
          this._StudentEnrollment.forEach((studentEnrollment, j) => {
            if (studentEnrollment['Section SIS ID'] === row['SIS ID']) {
              const rosterIndex = this._templateRosters.findIndex((roster) => {
                return (
                  roster.class_id === classId &&
                  roster.student_id === studentEnrollment['SIS ID']
                );
              });
              if (rosterIndex === -1) {
                this._templateRosters.push({
                  class_id: classId,
                  student_id: studentEnrollment['SIS ID'],
                  roster_id: j.toString(),
                });
              }
            }
          });

          // add instructors to a new artifical class
          this._TeacherRoster.forEach((teacherRoster) => {
            if (teacherRoster['Section SIS ID'] === row['SIS ID']) {
              const classesEntries = Object.entries(
                this._templateClasses[classIndex]
              );
              // check if istructor with given id exists
              const instructorExists = classesEntries.filter((pair) => {
                return (
                  pair[0].includes('instructor_id') &&
                  pair[1] === teacherRoster['SIS ID']
                );
              });

              // if not, add id to the first empty instructor_id_x field
              if (instructorExists.length < 1) {
                // find and empty field
                const emptyInstructorFieldIndex = classesEntries.findIndex(
                  (pair) => {
                    return (
                      pair[0].includes('instructor_id') &&
                      (pair[1] === undefined ||
                        pair[1] === null ||
                        pair[1]?.length < 1)
                    );
                  }
                );
                const freeInstructorField =
                  emptyInstructorFieldIndex !== -1
                    ? classesEntries[emptyInstructorFieldIndex][0]
                    : 'instructor_id';

                // add instructor id
                this._templateClasses[classIndex][freeInstructorField] =
                  teacherRoster['SIS ID'];
              }
            }
          });
        }
      });
    } else {
      throw new Error('Missing options');
    }
  }

  convertData() {
    this._buildLocations();
    this._buildStudents();
    this._buildStaff();
    this._buildCourses();
    if (this.options?.mergeClasses) {
      this._buildMargedClasses();
    } else {
      this._buildClasses();
    }
    this._buildRosters();
    removeEmptyColumns(this._templateClasses, 'instructor_id_');
    return this._template;
  }
}

//---------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------

// function buildLocations(data: FilesDataMS, template: FilesDataNoMsg) {
//   const indexShool = data.findIndex((value, i) => {
//     return Object.prototype.hasOwnProperty.call(value, 'school');
//   });
//   data[indexShool].school!.data!.forEach((x, i) => {
//     const row = x as MsSchool;
//     template[0].locations?.data.push({
//       location_id: row['SIS ID'] ? row['SIS ID'] : '',
//       location_name: row.Name ? row.Name : '',
//     });
//   });
// }

// function buildStudents(data: FilesDataMS, template: FilesDataNoMsg) {
//   const indexStudent = data.findIndex((value, i) => {
//     return Object.prototype.hasOwnProperty.call(value, 'student');
//   });
//   data[indexStudent].student!.data!.forEach((x) => {
//     const row = x as MsStudent;
//     template[1].students?.data.push({
//       person_id: row['SIS ID'] ? row['SIS ID'] : '',
//       person_number: row['Student Number'] ? row['Student Number'] : '',
//       first_name: row['First Name'] ? row['First Name'] : '',
//       middle_name: row['Middle Name'] ? row['Middle Name'] : '',
//       last_name: row['Last Name'] ? row['Last Name'] : '',
//       grade_level: row.Grade ? row.Grade : '',
//       email_address: row['Secondary Email'] ? row['Secondary Email'] : '',
//       sis_username: row.Username ? row.Username : '',
//       password_policy: '',
//       location_id: row['School SIS ID'] ? row['School SIS ID'] : '',
//     });
//   });
// }

// function buildStaff(data: FilesDataMS, template: FilesDataNoMsg) {
//   const indexTeacher = data.findIndex((value, i) => {
//     return Object.prototype.hasOwnProperty.call(value, 'teacher');
//   });
//   data[indexTeacher].teacher!.data!.forEach((x) => {
//     const row = x as MsTeacher;
//     template[2].staff?.data.push({
//       person_id: row['SIS ID'] ? row['SIS ID'] : '',
//       person_number: row['Teacher Number'] ? row['Teacher Number'] : '',
//       first_name: row['First Name'] ? row['First Name'] : '',
//       middle_name: row['Middle Name'] ? row['Middle Name'] : '',
//       last_name: row['Last Name'] ? row['Last Name'] : '',
//       email_address: row['Secondary Email'] ? row['Secondary Email'] : '',
//       sis_username: row.Username ? row.Username : '',
//       location_id: row['School SIS ID'] ? row['School SIS ID'] : '',
//     });
//   });
// }

// export default function convertData(
//   data: FilesDataMS,
//   isVulcan?: boolean
// ): FilesDataASM {
//   const template = [
//     { locations: { data: [] as AsmLocation[] } },
//     { students: { data: [] as AsmStudent[] } },
//     { staff: { data: [] as AsmStaff[] } },
//     { courses: { data: [] as AsmCourse[] } },
//     { classes: { data: [] as AsmClass[] } },
//     { rosters: { data: [] as AsmRoster[] } },
//   ];

//   const indexSection = data.findIndex((value, i) => {
//     return Object.prototype.hasOwnProperty.call(value, 'section');
//   });
//   const indexStudentEnrollment = data.findIndex((value, i) => {
//     return Object.prototype.hasOwnProperty.call(value, 'studentenrollment');
//   });
//   const indexTeacherRoster = data.findIndex((value, i) => {
//     return Object.prototype.hasOwnProperty.call(value, 'teacherroster');
//   });

//   // build locations
//   buildLocations(data, template);

//   // build students
//   buildStudents(data, template);

//   // build staff
//   buildStaff(data, template);

//   // build courses
//   data[indexSection].section!.data.forEach((x, i) => {
//     const row = x as MsSection;

//     let courseNumber =
//       (row['Course Number'] !== undefined &&
//         row['Course Number']!.length > 0) ||
//       i === 0
//         ? row['Course Number']
//         : (1000 + i).toString();

//     let courseName =
//       (row['Course Name'] !== undefined && row['Course Name']!.length > 0) ||
//       i === 0
//         ? row['Course Name']
//         : row['Section Name'];

//     if (isVulcan && i > 0) {
//       const words = row['Section Name'].split(' ');
//       // eslint-disable-next-line prefer-destructuring
//       courseNumber = words[0];
//       // eslint-disable-next-line prefer-destructuring
//       courseName = words[0];

//       const courseExsits = template[3].courses?.data.findIndex(
//         (item) => item.course_number === courseNumber
//       );
//       if (courseExsits && courseExsits > 0) {
//         return;
//       }
//     }

//     if (row['Course SIS ID'] && row['Course SIS ID'].length > 0) {
//       const courseExsits = template[3].courses?.data.findIndex(
//         (item) => item.course_id === row['Course SIS ID']
//       );
//       if (courseExsits && courseExsits > 0) {
//         return;
//       }
//     }

//     template[3].courses?.data.push({
//       course_id:
//         (row['Course SIS ID'] !== undefined &&
//           row['Course SIS ID']!.length > 0) ||
//         i === 0
//           ? row['Course SIS ID']
//           : (1000 + i).toString(),
//       course_number: courseNumber,
//       course_name: courseName,
//       location_id: row['School SIS ID'] ? row['School SIS ID'] : '',
//     });
//   });

//   const getInstructorSisId = (
//     sectionSisId: string,
//     index: number
//   ): string | '' => {
//     const instructors = (data[indexTeacherRoster].teacherroster!
//       .data as MsTeacherRoster[]).filter((x) => {
//       const row = x as MsTeacherRoster;
//       return row['Section SIS ID'] === sectionSisId;
//     });
//     if (instructors[index] !== undefined) {
//       return instructors[index]['SIS ID'];
//     }
//     return '';
//   };

//   // build classes
//   data[indexSection].section!.data!.forEach((x, i) => {
//     const row = x as MsSection;
//     let classNumber = row['Section Number'] ? row['Section Number'] : '';
//     let courseId =
//       (row['Course SIS ID'] !== undefined &&
//         row['Course SIS ID']!.length > 0) ||
//       i === 0
//         ? row['Course SIS ID']
//         : (1000 + i).toString();

//     if (isVulcan && i > 0) {
//       const words = row['Section Name'].split(' ');
//       // eslint-disable-next-line prefer-destructuring
//       const courseNumber = words[0];
//       const sectionName = row['Section Name'];
//       const beginClassNumber = sectionName.indexOf(' ') + 1;
//       const endClassNumber = sectionName.indexOf('(') - 1;
//       classNumber = sectionName.substring(beginClassNumber, endClassNumber);
//       courseId = template[3].courses!.data.find((element) => {
//         return (
//           element.course_number === courseNumber &&
//           element.location_id === row['School SIS ID']
//         );
//       })!.course_id!;
//     }

//     if (Object.entries(row).length === 0) {
//       template[4].classes?.data.push({} as AsmClass);
//     } else {
//       template[4].classes?.data.push({
//         class_id: row['SIS ID'] ? row['SIS ID'] : '',
//         class_number: classNumber,
//         course_id: courseId,
//         instructor_id: getInstructorSisId(row['SIS ID'], 0),
//         instructor_id_2: getInstructorSisId(row['SIS ID'], 1),
//         instructor_id_3: getInstructorSisId(row['SIS ID'], 2),
//         instructor_id_4: getInstructorSisId(row['SIS ID'], 3),
//         instructor_id_5: getInstructorSisId(row['SIS ID'], 4),
//         instructor_id_6: getInstructorSisId(row['SIS ID'], 5),
//         instructor_id_7: getInstructorSisId(row['SIS ID'], 6),
//         instructor_id_8: getInstructorSisId(row['SIS ID'], 7),
//         instructor_id_9: getInstructorSisId(row['SIS ID'], 8),
//         instructor_id_10: getInstructorSisId(row['SIS ID'], 9),
//         instructor_id_11: getInstructorSisId(row['SIS ID'], 10),
//         instructor_id_12: getInstructorSisId(row['SIS ID'], 11),
//         instructor_id_13: getInstructorSisId(row['SIS ID'], 12),
//         instructor_id_14: getInstructorSisId(row['SIS ID'], 13),
//         instructor_id_15: getInstructorSisId(row['SIS ID'], 14),
//         instructor_id_16: getInstructorSisId(row['SIS ID'], 15),
//         instructor_id_17: getInstructorSisId(row['SIS ID'], 16),
//         instructor_id_18: getInstructorSisId(row['SIS ID'], 17),
//         instructor_id_19: getInstructorSisId(row['SIS ID'], 18),
//         instructor_id_20: getInstructorSisId(row['SIS ID'], 19),
//         instructor_id_21: getInstructorSisId(row['SIS ID'], 20),
//         instructor_id_22: getInstructorSisId(row['SIS ID'], 21),
//         instructor_id_23: getInstructorSisId(row['SIS ID'], 22),
//         instructor_id_24: getInstructorSisId(row['SIS ID'], 23),
//         instructor_id_25: getInstructorSisId(row['SIS ID'], 24),
//         instructor_id_26: getInstructorSisId(row['SIS ID'], 25),
//         instructor_id_27: getInstructorSisId(row['SIS ID'], 26),
//         instructor_id_28: getInstructorSisId(row['SIS ID'], 27),
//         instructor_id_29: getInstructorSisId(row['SIS ID'], 28),
//         instructor_id_30: getInstructorSisId(row['SIS ID'], 29),
//         instructor_id_31: getInstructorSisId(row['SIS ID'], 30),
//         instructor_id_32: getInstructorSisId(row['SIS ID'], 31),
//         instructor_id_33: getInstructorSisId(row['SIS ID'], 33),
//         instructor_id_34: getInstructorSisId(row['SIS ID'], 34),
//         instructor_id_35: getInstructorSisId(row['SIS ID'], 35),
//         instructor_id_36: getInstructorSisId(row['SIS ID'], 36),
//         instructor_id_37: getInstructorSisId(row['SIS ID'], 37),
//         instructor_id_38: getInstructorSisId(row['SIS ID'], 38),
//         instructor_id_39: getInstructorSisId(row['SIS ID'], 39),
//         instructor_id_40: getInstructorSisId(row['SIS ID'], 40),
//         instructor_id_41: getInstructorSisId(row['SIS ID'], 41),
//         instructor_id_42: getInstructorSisId(row['SIS ID'], 42),
//         instructor_id_43: getInstructorSisId(row['SIS ID'], 43),
//         instructor_id_44: getInstructorSisId(row['SIS ID'], 44),
//         instructor_id_45: getInstructorSisId(row['SIS ID'], 45),
//         instructor_id_46: getInstructorSisId(row['SIS ID'], 46),
//         instructor_id_47: getInstructorSisId(row['SIS ID'], 47),
//         instructor_id_48: getInstructorSisId(row['SIS ID'], 48),
//         instructor_id_49: getInstructorSisId(row['SIS ID'], 49),
//         instructor_id_50: getInstructorSisId(row['SIS ID'], 50),
//         location_id: row['School SIS ID'] ? row['School SIS ID'] : '',
//       });
//     }
//   });

//   // build rosters
//   data[indexStudentEnrollment].studentenrollment!.data!.forEach((x, i) => {
//     const row = x as MsStudentEnrollement;
//     template[5].rosters?.data.push({
//       roster_id: i.toString(),
//       class_id: row['Section SIS ID'] ? row['Section SIS ID'] : '',
//       student_id: row['SIS ID'] ? row['SIS ID'] : '',
//     });
//   });

//   // remove unnecessary instructor fields
//   let maxInstructor: number;
//   for (let i = 4; i < 51; i += 1) {
//     const nthValues = template[4].classes?.data.filter((item) => {
//       return (
//         item[`instructor_id_${i.toString()}`] &&
//         item[`instructor_id_${i.toString()}`]!.length > 0
//       );
//     });
//     if (nthValues && nthValues.length < 1) {
//       maxInstructor = i - 1;
//       break;
//     }
//   }
//   template[4].classes?.data.forEach((item) => {
//     for (let i = maxInstructor + 1; i < 51; i += 1) {
//       delete item[`instructor_id_${i.toString()}`];
//     }
//   });

//   return template as FilesDataASM;
// }
