// import sqlite3 from 'sqlite3';
import knex from 'knex';
import log from 'electron-log';

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
  .raw(`PRAGMA foreign_keys = ON`)
  .raw(
    `CREATE TABLE locations (
  location_id TEXT,
  location_name TEXT,
  historical INTEGER DEFAULT 0,
  PRIMARY KEY(location_id, historical),
  CHECK(length(location_id)<257),
  CHECK(length(location_name)<257)
)`
  )
  .raw(
    `CREATE TABLE students (
  person_id TEXT,
  person_number TEXT,
  first_name TEXT NOT NULL,
  middle_name TEXT,
  last_name TEXT NOT NULL,
  grade_level TEXT,
  email_address TEXT,
  sis_username TEXT,
  password_policy INTEGER CHECK(
      password_policy IN (4, 6, 8)
      OR password_policy IS NULL OR password_policy LIKE ''
  ),
  location_id TEXT NOT NULL,
  historical INTEGER  DEFAULT 0,
  PRIMARY KEY(person_id, historical),
  FOREIGN KEY(location_id, historical) REFERENCES locations(location_id, historical),
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
  person_id TEXT,
  person_number TEXT,
  first_name TEXT NOT NULL,
  middle_name TEXT,
  last_name TEXT NOT NULL,
  email_address TEXT,
  sis_username TEXT,
  location_id TEXT NOT NULL,
  location_id_2 TEXT,
  location_id_3 TEXT,
  location_id_4 TEXT,
  location_id_5 TEXT,
  location_id_6 TEXT,
  location_id_7 TEXT,
  location_id_8 TEXT,
  location_id_10 TEXT,
  historical INTEGER DEFAULT 0,
  PRIMARY KEY(person_id, historical),
  FOREIGN KEY(location_id, historical) REFERENCES locations(location_id, historical),
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
    course_id TEXT,
    course_number TEXT,
    course_name TEXT,
    location_id TEXT NOT NULL,
    historical INTEGER DEFAULT 0,
    PRIMARY KEY(course_id, historical),
    FOREIGN KEY(location_id, historical) REFERENCES locations(location_id, historical),
    CHECK(length(course_id)<257),
    CHECK(length(course_name)<129),
    CHECK(length(course_number)<65),
    CHECK(length(location_id)<257)
  )`
  )
  .raw(
    `CREATE TABLE classes (
  class_id TEXT,
  class_number TEXT,
  course_id TEXT NOT NULL,
  instructor_id TEXT DEFAULT '',
  instructor_id_3 TEXT DEFAULT '',
  instructor_id_2 TEXT DEFAULT '',
  instructor_id_4 TEXT DEFAULT '',
instructor_id_5 TEXT DEFAULT '',
instructor_id_6 TEXT DEFAULT '',
instructor_id_7 TEXT DEFAULT '',
instructor_id_8 TEXT DEFAULT '',
instructor_id_9 TEXT DEFAULT '',
instructor_id_10 TEXT DEFAULT '',
instructor_id_11 TEXT DEFAULT '',
instructor_id_12 TEXT DEFAULT '',
instructor_id_13 TEXT DEFAULT '',
instructor_id_14 TEXT DEFAULT '',
instructor_id_15 TEXT DEFAULT '',
instructor_id_16 TEXT DEFAULT '',
instructor_id_17 TEXT DEFAULT '',
instructor_id_18 TEXT DEFAULT '',
instructor_id_19 TEXT DEFAULT '',
instructor_id_20 TEXT DEFAULT '',
instructor_id_21 TEXT DEFAULT '',
instructor_id_22 TEXT DEFAULT '',
instructor_id_23 TEXT DEFAULT '',
instructor_id_24 TEXT DEFAULT '',
instructor_id_25 TEXT DEFAULT '',
instructor_id_26 TEXT DEFAULT '',
instructor_id_27 TEXT DEFAULT '',
instructor_id_28 TEXT DEFAULT '',
instructor_id_29 TEXT DEFAULT '',
instructor_id_30 TEXT DEFAULT '',
instructor_id_31 TEXT DEFAULT '',
instructor_id_32 TEXT DEFAULT '',
instructor_id_33 TEXT DEFAULT '',
instructor_id_34 TEXT DEFAULT '',
instructor_id_35 TEXT DEFAULT '',
instructor_id_36 TEXT DEFAULT '',
instructor_id_37 TEXT DEFAULT '',
instructor_id_38 TEXT DEFAULT '',
instructor_id_39 TEXT DEFAULT '',
instructor_id_40 TEXT DEFAULT '',
instructor_id_41 TEXT DEFAULT '',
instructor_id_42 TEXT DEFAULT '',
instructor_id_43 TEXT DEFAULT '',
instructor_id_44 TEXT DEFAULT '',
instructor_id_45 TEXT DEFAULT '',
instructor_id_46 TEXT DEFAULT '',
instructor_id_47 TEXT DEFAULT '',
instructor_id_48 TEXT DEFAULT '',
instructor_id_49 TEXT DEFAULT '',
instructor_id_50 TEXT DEFAULT '',
instructor_id_51 TEXT DEFAULT '',
    instructor_id_52 TEXT DEFAULT '',
    instructor_id_53 TEXT DEFAULT '',
    instructor_id_54 TEXT DEFAULT '',
    instructor_id_55 TEXT DEFAULT '',
    instructor_id_56 TEXT DEFAULT '',
    instructor_id_57 TEXT DEFAULT '',
    instructor_id_58 TEXT DEFAULT '',
    instructor_id_59 TEXT DEFAULT '',
    instructor_id_60 TEXT DEFAULT '',
    instructor_id_61 TEXT DEFAULT '',
    instructor_id_62 TEXT DEFAULT '',
    instructor_id_63 TEXT DEFAULT '',
    instructor_id_64 TEXT DEFAULT '',
    instructor_id_65 TEXT DEFAULT '',
    instructor_id_66 TEXT DEFAULT '',
    instructor_id_67 TEXT DEFAULT '',
    instructor_id_68 TEXT DEFAULT '',
    instructor_id_69 TEXT DEFAULT '',
    instructor_id_70 TEXT DEFAULT '',
    instructor_id_71 TEXT DEFAULT '',
    instructor_id_72 TEXT DEFAULT '',
    instructor_id_73 TEXT DEFAULT '',
    instructor_id_74 TEXT DEFAULT '',
    instructor_id_75 TEXT DEFAULT '',
    instructor_id_76 TEXT DEFAULT '',
    instructor_id_77 TEXT DEFAULT '',
    instructor_id_78 TEXT DEFAULT '',
    instructor_id_79 TEXT DEFAULT '',
    instructor_id_80 TEXT DEFAULT '',
  location_id TEXT NOT NULL,
  historical INTEGER DEFAULT 0,
  PRIMARY KEY(class_id, historical),
  FOREIGN KEY(course_id, historical) REFERENCES courses(course_id, historical),
  FOREIGN KEY(location_id, historical) REFERENCES locations(location_id, historical),
  CHECK(length(class_id)<257),
  CHECK(length(class_number)<65),
  CHECK(length(course_id)<257),
  CHECK(length(location_id)<257)
)`
  )
  .raw(
    `CREATE TABLE rosters (
  roster_id TEXT,
  class_id TEXT NOT NULL,
  student_id TEXT NOT NULL,
  historical INTEGER DEFAULT 0,
  PRIMARY KEY(roster_id, historical),
  FOREIGN KEY(class_id, historical) REFERENCES classes(class_id, historical),
  FOREIGN KEY(student_id, historical) REFERENCES students(person_id, historical),
  CHECK(length(student_id)<257),
  CHECK(length(class_id)<257)
)`
  )
  .then(() => console.log('knex done'))
  .catch((err) => {
    console.error(err);
    log.error(err);
  });

export default db;
