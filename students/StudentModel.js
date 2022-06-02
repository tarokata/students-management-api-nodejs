require('dotenv').config({ path: '../.env'});
const { get } = require('http');
const Redis = require('ioredis');

const config = {
  host: process.env.REDIS_HOST_NAME,
  port: process.env.REDIS_PORT_NUMBER,
  username: process.env.REDIS_USER_NAME,
  password: process.env.REDIS_PASSWORD_KEY
};

const redis = new Redis(config);

const students = {
  "20521712": {
    "fullname": "Bùi Ngọc Tuyết Nhi"
  },
  "20521229": {
    "fullname": "Bùi Quang Duy"
  },
  "20521191": {
    "fullname": "Bùi Vũ Minh Đức"
  },
  "205211958": {
    "fullname": "Đặng Trần Tuấn Anh"
  },
  "20521206": {
    "fullname": "Hoàng Anh Dũng"
  },
  "20521447": {
    "fullname": "Lê Duy Khánh"
  },
};

const attendedStudentIDs = ['20521712', '20521229', '20521191'];

const getDateTime = () => {
  const dateObj = new Date();
  const dateTimeStr = `${dateObj.getDate()}-${dateObj.getMonth()+1}-${dateObj.getFullYear()}`;
  return dateTimeStr;
}

async function getAllStudents() {
  const json = await redis.call('JSON.GET', 'students', '$');
  const students = JSON.parse(json)[0];
  return students;
}

async function getOneStudent(studentID = 0) {
  const json = await redis.call('JSON.GET', 'students', `$..${studentID}`);
  const studentInfo = JSON.parse(json)[0];
  return studentInfo;
}

async function getManyStudents(studentIDs) {
  const students = new Object();
  for(const studentID of studentIDs) {
    const studentInfo = await getOneStudent(studentID);
    students[studentID] = studentInfo;
  }
  return students;
};

async function insertOneNewStudent(newStudent) {
  await redis.call('JSON.SET', 'students', `$.${newStudent.studentID}`, JSON.stringify(newStudent.studentInfo));

  const json = await redis.call('JSON.GET', 'students', `$.${newStudent.studentID}`);
  const insertedStudent = { [newStudent.studentID]: JSON.parse(json)[0] };
  return insertedStudent;
}

async function insertNewStudents(newStudents) {
  for(const newStudentID of Object.keys(newStudents)) {
    const newStudent = {
      studentID: newStudentID,
      studentInfo: newStudents[newStudentID]
    }
    await insertOneNewStudent(newStudent);
  }

  const insertedStudents = {};
  const studentIDs = Object.keys(newStudents);

  for(const studentID of studentIDs) {
    const json = await redis.call('JSON.GET', 'students', `$.${studentID}`);
    const insertedStudentInfo = JSON.parse(json)[0];
    insertedStudents[studentID] = insertedStudentInfo;
  }
  return insertedStudents;
}

async function deleteAllStudents() {
  await redis.call('JSON.DEL', 'students', '$');
}

async function deleteOneStudent(studentID) {
  await redis.call('JSON.DEL', 'students', `$.${studentID}`);
}

async function getAllStudentsAttendanceStatus(date) {
  const json = await redis.call('JSON.GET', 'studentsAttendance', `$.${date}`);
  const response = JSON.parse(json)[0];
  return response;
}

async function getOneStudentAttendanceStatus(date, studentID) {
  const json = await redis.call('JSON.GET', 'studentsAttendance', `$.${date}.${studentID}`);
  const response = JSON.parse(json)[0];
  return response;
}

async function getManyStudentsAttendanceStatus(date, studentIDs) {
  const studentsAttendanceStatus = new Object();
  for(const studentID of studentIDs) {
    const studentAttendanceStatus = await getOneStudentAttendanceStatus(date, studentID);
    studentsAttendanceStatus[studentID] = studentAttendanceStatus;
  }
  return studentsAttendanceStatus;
}

async function updateStudentsAttendanceStatus(attendedStudentIDs = []) {
  const currentDateTime = getDateTime();

  const attendanceRecord = {};
  attendanceRecord[currentDateTime] = {};

  const students = await getAllStudents();
  const currentAttendanceStatus = getAllStudentsAttendanceStatus();

  for(const studentID of Object.keys(students)) {
    if(attendedStudentIDs.includes(studentID)) {
      attendanceRecord[currentDateTime][studentID] = {
        'entered': true
      };
    } else {
      attendanceRecord[currentDateTime][studentID] = {
        'entered': currentAttendanceStatus[studentID]['entered']
      }
    }
  }

  await redis.call('JSON.SET', 'studentsAttendance', '$', JSON.stringify(attendanceRecord));
  const json = await redis.call('JSON.GET', 'studentsAttendance', `$.${currentDateTime}`);
  const response = JSON.parse(json)[0];
  return response;
}

async function updateOneStudentAttendanceStatus(date, studentID, enter_time, entered) {
  await redis.call('JSON.SET', 'studentsAttendance', `$.${date}.${studentID}`, JSON.stringify({ entered: entered, enter_time: enter_time }));
  const json = await redis.call('JSON.GET', 'studentsAttendance', `$.${date}.${studentID}`);
  const response = JSON.parse(json)[0];
  return response;
}

async function deleteOneStudentAttendanceStatus(studentID) {

}

module.exports = {
  getOneStudentAttendanceStatus,
  getManyStudentsAttendanceStatus,
  getAllStudentsAttendanceStatus,
  updateOneStudentAttendanceStatus,
  updateStudentsAttendanceStatus,
  deleteOneStudent,
  getOneStudent,
  getManyStudents,
  getAllStudents,
  insertOneNewStudent,
  insertNewStudents
};