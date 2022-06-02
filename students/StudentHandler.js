const { 
  getOneStudentAttendanceStatus, 
  getManyStudentsAttendanceStatus,
  getAllStudentsAttendanceStatus, 
  updateOneStudentAttendanceStatus, 
  getOneStudent,
  getManyStudents,
  getAllStudents,
  insertOneNewStudent,
  insertNewStudents,
  deleteOneStudent
} = require('./StudentModel');

// get all students attendance status  
async function getAllStudentsAttendanceStatusHandler(request, h) {
  const date = request.params.date;
  const studentsAttendanceStatus = await getAllStudentsAttendanceStatus(date);
  return studentsAttendanceStatus;
}

// get one student attendance status
async function getOneStudentAttendanceStatusHandler(request, h) {
  const date = request.params.date;
  const studentID = request.params.studentID;
  const studentAttendanceStatus = await getOneStudentAttendanceStatus(date, studentID);
  return studentAttendanceStatus;
}

// get many student attendance status
async function getManyStudentAttendanceStatusHandler(request, h) {
  const date = request.params.date;
  const studentIDs = request.params.studentID.split('/');
  const studentsStatus = await getManyStudentsAttendanceStatus(date, studentIDs);
  return studentsStatus;
}

// set students attendance status to true
async function updateStudentsAttendanceStatusHandler(request, h) {
  const payload = request.payload;
  if(Array.isArray(payload)) {
    let currentDate = null;
    const studentIDs = new Array();
    for(const status of payload) {
      const { date, studentID, enter_time, entered } = status;
      currentDate = date;
      studentIDs.push(studentID);
      await updateOneStudentAttendanceStatus(date, studentID, enter_time, entered);
    }
    const studentsStatus = await getManyStudentsAttendanceStatus(currentDate, studentIDs);
    return studentsStatus;

  } else {
    const { date, studentID, enter_time, entered } = request.payload;
    const updatedAttendanceStatus = await updateOneStudentAttendanceStatus(date, studentID, enter_time, entered);
    return updatedAttendanceStatus;
  }
}

// delete students attendance status 

// get all students
async function getAllStudentsHandler(request, h) {
  const students = await getAllStudents();
  return students;
}

// get one student
async function getOneStudentHandler(request, h) {
  const studentID = request.params.studentID;
  const studentInfo = await getOneStudent(studentID);
  return { [studentID] : studentInfo };
}

// get many student
async function getManyStudentsHandler(request, h) {
  const studentIDs = request.params.studentID.split('/');
  const students = await getManyStudents(studentIDs);
  return students;
}

// add student
async function addNewStudentHandler(request, h) {
  const payload = request.payload;
  const newStudentsData = payload;
  if(Array.isArray(newStudentsData)) { 
    const existingStudents = await getAllStudents();
    // console.log('Exisiting', existingStudents);

    const alreadyInsertedStudentIDs = new Array();
    for(const newStudent of newStudentsData) {
      for(const existingStudentID of Object.keys(existingStudents)) {
        if(newStudent.studentID == existingStudentID) 
          alreadyInsertedStudentIDs.push(newStudent.studentID);
      }
    }

    // console.log('already ids', alreadyInsertedStudentIDs);
    
    const newStudentsIsAboutToInsert = new Object();
    for(const studentInfo of newStudentsData) {
      if(!alreadyInsertedStudentIDs.includes(studentInfo.studentID)) {
        newStudentsIsAboutToInsert[studentInfo.studentID] = {
          'fullname': studentInfo.fullname
        };
      }
    }

    // console.log(newStudentsIsAboutToInsert);
    if(Object.keys(newStudentsIsAboutToInsert).length === 0) {
      return { message: 'All students already exist'};
    } else {
      const insertedStudents = await insertNewStudents(newStudentsIsAboutToInsert);
      return {
        insertSuccessfully: alreadyInsertedStudentIDs,
        existingStudents: insertedStudents
      };
    }
  } else {
    const alreadyExistingStudent = await getOneStudent(newStudentsData.studentID);
    if(alreadyExistingStudent) {
      return { message: `student with id: ${newStudentsData.studentID} already exists` };
    }
    
    // insert one student
    const newStudent = {
      studentID: newStudentsData.studentID,
      studentInfo: {
        'fullname': newStudentsData.fullname
      }
    };

    const insertedStudent = await insertOneNewStudent(newStudent);
    return insertedStudent;
  }
}

// delete one student
async function deleteOneStudentHandler(request, h) {
  const studentID = request.params.studentID;
  await deleteOneStudent(studentID);
  const students = await getAllStudents();
  return students;
}

// delete many students
async function deleteManyStudentsHandler(request, h) {
  const studentIDs = request.params.studentID.split('/');
  for(const studentID of studentIDs) {
    await deleteOneStudent(studentID);
  }
  const students = await getAllStudents();
  return students;
}

module.exports = {
  getAllStudentsAttendanceStatusHandler,
  getOneStudentAttendanceStatusHandler,
  getManyStudentAttendanceStatusHandler,
  updateStudentsAttendanceStatusHandler,
  getAllStudentsHandler,
  getOneStudentHandler,
  getManyStudentsHandler,
  addNewStudentHandler,
  deleteOneStudentHandler,
  deleteManyStudentsHandler
};