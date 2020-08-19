// import sqlite3 from 'sqlite3';
import knex from 'knex';

// const db = new sqlite3.Database(':memory;');

const db = knex({
  client: 'sqlite3',
  connection: {
    filename: ':memory:',
  },
  useNullAsDefault: true,
  debug: process.env.NODE_ENV === 'development',
});

// eslint-disable-next-line no-control-regex
// const regexEmail = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;

db.schema
  .raw(
    `CREATE TABLE locations (
  location_id TEXT PRIMARY KEY,
  location_name TEXT,
  CHECK(length(location_id)<257),
  CHECK(length(location_name)<257)
)`
  )
  .raw(
    `CREATE TABLE students (
  person_id TEXT PRIMARY KEY,
  person_number TEXT,
  first_name TEXT NOT NULL,
  middle_name TEXT,
  last_name TEXT NOT NULL,
  grade_level TEXT,
  email_address TEXT,
  sis_username TEXT,
  password_policy INTEGER CHECK(
      password_policy IN (4, 6, 8)
      OR password_policy IS NULL
  ),
  location_id TEXT NOT NULL,
  FOREIGN KEY(location_id) REFERENCES locations(location_id),
  CHECK(length(first_name)<33),
  CHECK(length(middle_name)<33),
  CHECK(length(last_name)<65),
  CHECK(length(grade_level)<65),
  CHECK(length(email_address)<257),
  CHECK(length(person_number)<65),
  CHECK(length(person_id)<257),
  CHECK(length(sis_username)<257),
  CHECK(length(location_id)<257)
)`
  )
  .raw(
    `CREATE TABLE staff (
  person_id TEXT PRIMARY KEY,
  person_number TEXT,
  first_name TEXT NOT NULL,
  middle_name TEXT,
  last_name TEXT NOT NULL,
  email_address TEXT,
  sis_username TEXT,
  location_id TEXT NOT NULL,
  FOREIGN KEY(location_id) REFERENCES locations(location_id),
  CHECK(length(first_name)<33),
  CHECK(length(middle_name)<33),
  CHECK(length(last_name)<65),
  CHECK(length(email_address)<257),
  CHECK(length(person_number)<65),
  CHECK(length(person_id)<257),
  CHECK(length(sis_username)<257),
  CHECK(length(location_id)<257)
)`
  )
  .raw(
    `CREATE TABLE courses (
    course_id TEXT PRIMARY KEY,
    course_number TEXT,
    course_name TEXT,
    location_id TEXT NOT NULL,
    FOREIGN KEY(location_id) REFERENCES locations(location_id),
    CHECK(length(course_id)<257),
    CHECK(length(course_name)<129),
    CHECK(length(course_number)<65),
    CHECK(length(location_id)<257)
  )`
  )
  .raw(
    `CREATE TABLE classes (
  class_id TEXT PRIMARY KEY,
  class_number TEXT,
  course_id TEXT NOT NULL,
  instructor_id TEXT,
  instructor_id_2 TEXT,
  instructor_id_3 TEXT,
  location_id TEXT NOT NULL,
  FOREIGN KEY(instructor_id) REFERENCES staff(person_id),
  FOREIGN KEY(instructor_id_2) REFERENCES staff(person_id),
  FOREIGN KEY(instructor_id_3) REFERENCES staff(person_id),
  FOREIGN KEY(course_id) REFERENCES courses(course_id),
  FOREIGN KEY(location_id) REFERENCES locations(location_id),
  CHECK(length(class_id)<257),
  CHECK(length(class_number)<65),
  CHECK(length(course_id)<257),
  CHECK(length(location_id)<257)
)`
  )
  .raw(
    `CREATE TABLE rosters (
  roster_id TEXT PRIMARY KEY,
  class_id TEXT NOT NULL,
  student_id TEXT NOT NULL,
  FOREIGN KEY(class_id) REFERENCES classes(class_id),
  FOREIGN KEY(student_id) REFERENCES students(person_id),
  CHECK(length(student_id)<257),
  CHECK(length(class_id)<257)
)`
  )
  .then(() => console.log('knex done'))
  .catch((err) => console.error(err));

// try {
//   db.serialize(() => {
//     db.run(`CREATE TABLE locations (
//       location_id TEXT PRIMARY KEY,
//       location_name TEXT,
//       CHECK(length(location_id)<257),
//       CHECK(length(location_name)<257)
//   )`);
//     db.run(`CREATE TABLE students (
//     person_id TEXT PRIMARY KEY,
//     person_number TEXT,
//     first_name TEXT NOT NULL,
//     middle_name TEXT,
//     last_name TEXT NOT NULL,
//     grade_level TEXT,
//     email_address TEXT CHECK(
//         email_address NOT GLOB '${regexEmail}'
//     ),
//     sis_username TEXT,
//     password_policy INTEGER CHECK(
//         password_policy IN (4, 6, 8)
//         OR password_policy IS NULL
//     ),
//     location_id TEXT NOT NULL,
//     FOREIGN KEY(location_id) REFERENCES locations(location_id),
//     CHECK(length(first_name)<33),
//     CHECK(length(middle_name)<33),
//     CHECK(length(last_name)<65),
//     CHECK(length(grade_level)<65),
//     CHECK(length(email_address)<257),
//     CHECK(length(person_number)<65),
//     CHECK(lenght(person_id)<257),
//     CHECK(length(sis_username)<257),
//     CHECK(length(location_id)<257)
//   )`);
//     db.run(`CREATE TABLE staff (
//     person_id TEXT PRIMARY KEY,
//     person_number TEXT,
//     first_name TEXT NOT NULL,
//     middle_name TEXT,
//     last_name TEXT NOT NULL,
//     email_address TEXT CHECK(
//         email_address NOT GLOB '${regexEmail}'
//     ),
//     sis_username TEXT,
//     location_id TEXT NOT NULL,
//     FOREIGN KEY(location_id) REFERENCES locations(location_id),
//     CHECK(length(first_name)<33),
//     CHECK(length(middle_name)<33),
//     CHECK(length(last_name)<65),
//     CHECK(length(email_address)<257),
//     CHECK(length(person_number)<65),
//     CHECK(lenght(person_id)<257),
//     CHECK(length(sis_username)<257),
//     CHECK(length(location_id)<257)
//   )`);
//     db.run(`CREATE TABLE courses (
//     course_id TEXT PRIMARY KEY,
//     course_number TEXT,
//     course_name TEXT,
//     location_id TEXT NOT NULL,
//     FOREIGN KEY(location_id) REFERENCES locations(location_id),
//     CHECK(length(course_id)<257),
//     CHECK(length(course_name)<129),
//     CHECK(length(course_number)<65),
//     CHECK(length(location_id)<257)
//   )`);
//     db.run(`CREATE TABLE classes (
//     class_id TEXT PRIMARY KEY,
//     class_number TEXT,
//     course_id TEXT NOT NULL,
//     instructor_id TEXT,
//     instructor_id_2 TEXT,
//     instructor_id_3 TEXT,
//     location_id TEXT NOT NULL,
//     FOREIGN KEY(instructor_id) REFERENCES staff(person_id),
//     FOREIGN KEY(instructor_id_2) REFERENCES staff(person_id),
//     FOREIGN KEY(instructor_id_3) REFERENCES staff(person_id),
//     FOREIGN KEY(course_id) REFERENCES courses(course_id),
//     FOREIGN KEY(location_id) REFERENCES locations(location_id),
//     CHECK(length(person_id)<257),
//     CHECK(length(class_id)<257),
//     CHECK(length(class_number)<65),
//     CHECK(length(course_id)<257),
//     CHECK(length(location_id)<257)
//   )`);
//     db.run(`CREATE TABLE rosters (
//     roster_id TEXT PRIMARY KEY,
//     class_id TEXT NOT NULL,
//     student_id TEXT NOT NULL,
//     FOREIGN KEY(class_id) REFERENCES classes(class_id),
//     FOREIGN KEY(student_id) REFERENCES students(person_id),
//     CHECK(length(student_id)<257),
//     CHECK(length(class_id)<257)
//   )`);
//   });
// } catch (error) {
//   console.error(error);
// }

export default db;
