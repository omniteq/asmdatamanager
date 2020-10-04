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
import { FilesASM, Options, Parser, SectionColumns } from '../converter';
import findObjectByProperty from './utils';

function generateProperties(
  name: string,
  rangeFrom: number,
  rangeTo: number,
  valueParam?: { indexModificator: number; arg?: any },
  getValueFunction?: (arg: any, index: number) => any
) {
  const object: any = {};
  for (let i = rangeFrom; i < rangeTo + 1; i += 1) {
    if (valueParam && getValueFunction) {
      object[name + i] = getValueFunction(
        valueParam.arg,
        i + valueParam.indexModificator
      );
    } else {
      object[name + i] = null;
    }
  }
  return object;
}

export function removeEmptyColumns(
  array: any[],
  fieldNamePattern: string,
  fromIndex: number
) {
  // remove unnecessary instructor fields
  let maxInstructor: number;
  for (let i = fromIndex; i < 81; i += 1) {
    const nthValues = array.filter((item) => {
      return (
        item[`${fieldNamePattern}${i.toString()}`] &&
        item[`${fieldNamePattern}${i.toString()}`]
      );
    });
    if (nthValues && nthValues.length < 1) {
      maxInstructor = i - 1;
      break;
    }
  }
  array.forEach((item) => {
    for (let i = maxInstructor + 1; i < 81; i += 1) {
      delete item[`${fieldNamePattern}${i.toString()}`];
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

  private _getClassNumberParser() {
    if (this.options && this.options.classNumberColumnName) {
      const { classNumberColumnName } = this.options;
      const parserIndex = this.options?.parsers?.findIndex(
        (element) =>
          element.fileName === 'section' &&
          element.columnName === classNumberColumnName
      );
      if (parserIndex !== undefined && parserIndex > -1) {
        const parser =
          this.options &&
          this.options.parsers &&
          this.options.parsers[parserIndex];
        return parser;
      }
    }
    return false;
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
      const staffExists = this._templateStaff.findIndex(
        (person: AsmStaff) => person.person_id === row['SIS ID']
      );

      if (staffExists === -1) {
        const locations = this._Teacher
          .map((item) => {
            if (item['SIS ID'] === row['SIS ID']) {
              return item['School SIS ID'];
            }
            return undefined;
          })
          .filter((value) => value !== undefined);

        this._templateStaff.push({
          person_id: row['SIS ID'] ? row['SIS ID'] : '',
          person_number: row['Teacher Number'] ? row['Teacher Number'] : '',
          first_name: row['First Name'] ? row['First Name'] : '',
          middle_name: row['Middle Name'] ? row['Middle Name'] : '',
          last_name: row['Last Name'] ? row['Last Name'] : '',
          email_address: row['Secondary Email'] ? row['Secondary Email'] : '',
          sis_username: row.Username ? row.Username : '',
          location_id: row['School SIS ID'] ? row['School SIS ID'] : '',
          ...generateProperties(
            'location_id_',
            2,
            10,
            { indexModificator: -1, arg: locations },
            (locationIds, index) => {
              return locationIds[index];
            }
          ),
        });
      }
    });
  }

  private _buildCourses() {
    let subjectColumnName: SectionColumns;
    let subjectDestColumnName: 'class_number' | 'course_name';
    let subjectParser: Parser | undefined;
    if (
      this.options &&
      this.options.subjectColumnName &&
      this.options.subjectDestColumnName
    ) {
      subjectColumnName = this.options.subjectColumnName;
      subjectDestColumnName = this.options.subjectDestColumnName;
      subjectParser = this.options.parsers?.find(
        (parser) => parser.isSubject === true
      );
    }
    if (
      this.options?.singleCourse === true &&
      this.options?.singleCourseName === undefined &&
      this.options!.singleCourseName!.length < 1
    )
      throw Error(
        'Course name cannot be empty if this.options.singleCourse = true'
      );

    // create only one course for location if singleCourse is true
    if (this.options?.singleCourse === true) {
      this._Shool.forEach((x, i) => {
        const row = x as MsSchool;
        this._templateCourses.push({
          course_id: row['SIS ID'] ? row['SIS ID'] : '',
          course_number:
            this.options && this.options.singleCourseName
              ? this.options.singleCourseName
              : i.toString(),
          course_name:
            this.options && this.options.singleCourseName
              ? this.options.singleCourseName
              : i.toString(),
          location_id: row['SIS ID'] ? row['SIS ID'] : '',
        });
      });
    } else {
      this._Section.forEach((x, i) => {
        const row = x as MsSection;
        if (Object.entries(row).length === 0) {
          this._templateCourses.push({} as AsmCourse);
        } else {
          if (row['Course SIS ID'] && row['Course SIS ID'].length > 0) {
            const courseExsits = this._templateCourses.findIndex(
              (item) => item.course_id === row['Course SIS ID']
            );
            if (courseExsits && courseExsits > 0) {
              return;
            }
          }

          let courseName =
            (row['Course Name'] !== undefined &&
              row['Course Name']!.length > 0) ||
            i === 0
              ? row['Course Name']
              : row['Section Name'];

          if (subjectDestColumnName === 'course_name') {
            courseName = subjectParser
              ? subjectParser?.parserFunc(row[subjectColumnName])
              : row[subjectColumnName] || '';
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
            course_name: courseName,
            location_id: row['School SIS ID'] ? row['School SIS ID'] : '',
          });
        }
      });
    }
  }

  private _buildMergedCourses() {
    let subjectColumnName: SectionColumns;
    let subjectDestColumnName: 'class_number' | 'course_name';
    let subjectParser: Parser | undefined;
    if (
      this.options &&
      this.options.subjectColumnName &&
      this.options.subjectDestColumnName
    ) {
      subjectColumnName = this.options.subjectColumnName;
      subjectDestColumnName = this.options.subjectDestColumnName;
      subjectParser = this.options.parsers?.find(
        (parser) => parser.isSubject === true
      );
    }
    if (
      this.options &&
      this.options.classYear &&
      this.options.classNumberColumnName
    ) {
      const { classNumberColumnName, classYear } = this.options;
      const parser = this._getClassNumberParser();

      this._Section.forEach((x, i) => {
        const row = x as MsSection;

        if (Object.entries(row).length === 0) {
          this._templateCourses.push({} as AsmClass);
        } else {
          let classNumber;
          if (parser) {
            classNumber = parser?.parserFunc(row[classNumberColumnName]);
          }

          let courseName = classNumber || row[classNumberColumnName];

          if (subjectDestColumnName === 'course_name') {
            courseName = subjectParser
              ? subjectParser?.parserFunc(row[subjectColumnName])
              : row[subjectColumnName] || '';
          }

          const courseId = `${row['School SIS ID']}_${
            classNumber || row[classNumberColumnName]
          }_${classYear}`;

          // check if course exists
          let courseIndex = this._templateCourses.findIndex((element) => {
            return element.course_id === courseId;
          });

          // if class doesn't exist, create one
          if (courseIndex === -1) {
            courseIndex =
              this._templateCourses.push({
                course_id: courseId,
                course_name: courseName,
                course_number: classNumber || row[classNumberColumnName],
                location_id: row['School SIS ID'],
              }) - 1;
          }
        }
      });
      // modify classes course_id to add to a new artficial courses
      this._templateClasses.forEach((element, y) => {
        if (Object.entries(element).length !== 0) {
          const sectionRow = this._Section.find(
            (section) => section['SIS ID'] === element.class_id
          );
          const classNumber =
            (parser &&
              parser?.parserFunc(sectionRow![classNumberColumnName])) ||
            sectionRow![classNumberColumnName];
          element.course_id = `${sectionRow!['School SIS ID']}_${
            classNumber || sectionRow![classNumberColumnName]
          }_${classYear}`;
        }
      });
    } else {
      throw new Error('Missing options');
    }
  }

  private _buildClasses() {
    // if (
    //   this.options &&
    //   this.options.subjectColumnName &&
    //   this.options.subjectDestColumnName &&
    //   this.options.classNumberColumnName
    // ) {
    const subjectColumnName: SectionColumns | undefined = this.options
      ?.subjectColumnName;
    const subjectDestColumnName:
      | 'class_number'
      | 'course_name'
      | undefined = this.options?.subjectDestColumnName;
    const subjectParser: Parser | undefined = this.options?.parsers?.find(
      (parser) => parser.isSubject === true
    );
    const classColumnName: SectionColumns | undefined = this.options
      ?.classNumberColumnName;
    const classNumberParser = this._getClassNumberParser();
    this._Section.forEach((x, i) => {
      const row = x as MsSection;
      if (Object.entries(row).length === 0) {
        this._templateClasses.push({} as AsmClass);
      } else {
        let classNumber = row['Section Number'] ? row['Section Number'] : '';

        if (subjectDestColumnName === 'class_number' && subjectColumnName) {
          classNumber = subjectParser
            ? subjectParser?.parserFunc(row[subjectColumnName])
            : row[subjectColumnName] || '';
        }
        if (subjectDestColumnName === 'course_name' && classColumnName) {
          classNumber = classNumberParser
            ? classNumberParser?.parserFunc(row[classColumnName])
            : row[classColumnName] || '';
        }

        this._templateClasses.push({
          class_id: row['SIS ID'] ? row['SIS ID'] : '',
          class_number: classNumber,
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
    // }
  }

  private _buildMargedClasses() {
    if (
      this.options &&
      this.options.classYear &&
      this.options.classNumberColumnName
    ) {
      const { classNumberColumnName, classYear } = this.options;
      this._templateRosters.push({} as AsmRoster);
      this._Section.forEach((x, i) => {
        const row = x as MsSection;

        if (Object.entries(row).length === 0) {
          this._templateClasses.push({} as AsmClass);
        } else {
          let classNumber;
          // is there a parser for section::classNumberColumnName?
          const parser = this._getClassNumberParser();
          if (parser) {
            classNumber = parser?.parserFunc(row[classNumberColumnName]);
          }
          const classId = `${row['School SIS ID']}_${
            classNumber || row[classNumberColumnName]
          }_${classYear}`;

          // check if class exists
          let classIndex = this._templateClasses.findIndex((element) => {
            return element.class_id === classId;
          });

          // if class doesn't exist, create one
          if (classIndex === -1) {
            classIndex =
              this._templateClasses.push({
                class_id: classId,
                class_number: classNumber || row[classNumberColumnName],
                course_id:
                  (this.options?.singleCourse && row['School SIS ID']) ||
                  ((row['Course SIS ID'] !== undefined &&
                    row['Course SIS ID']!.length > 0) ||
                  i === 0
                    ? row['Course SIS ID']
                    : (1000 + i).toString()),
                instructor_id: null,
                ...generateProperties('instructor_id_', 2, 80),
                location_id: row['School SIS ID'],
              }) - 1;
          }

          // enroll students to a new artficial class
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
              const instructorsCount = classesEntries.filter((pair) => {
                return pair[0].includes('instructor_id') && pair[1] !== null;
              }).length;

              // if not, add id to the first empty instructor_id_x field
              if (instructorExists.length < 1) {
                const instructorField =
                  instructorsCount < 1
                    ? 'instructor_id'
                    : `instructor_id_${instructorsCount + 1}`;

                // add instructor id
                this._templateClasses[classIndex][instructorField] =
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

  convertData() {
    this._buildLocations();
    this._buildStudents();
    this._buildStaff();
    if (this.options?.mergeClasses) {
      this._buildMargedClasses();
    } else {
      this._buildClasses();
      this._buildRosters();
    }
    if (this.options?.mergeCourses) {
      // this modifies classes so needs to be called after classes are build
      this._buildMergedCourses();
    } else {
      this._buildCourses();
    }
    removeEmptyColumns(this._templateClasses, 'instructor_id_', 4);
    removeEmptyColumns(this._templateStaff, 'location_id_', 2);
    return this._template;
  }
}
