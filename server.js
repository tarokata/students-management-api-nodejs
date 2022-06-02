const Hapi = require('@hapi/hapi');
const Bcrypt = require('bcrypt');
require('dotenv').config();

const { 
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
} = require('./students/StudentHandler');

const host = process.env.SERVER_HOST_NAME;
const port = process.env.SERVER_PORT_NUMBER;

const users = {
  LuuTanHung: {
    username: 'LuuTanHung',
    password: '$2a$12$D.ep3lwGjRQuedvjN33dB.IGKnd3jBzT1/TTeauF/KhvLgJGTPkBm', // @xw_:Pf7WmHR447
    name: 'Tan Hung',
    id: '2133d32a'
  },
  NguyenThanhHieu: {
    username: 'NguyenThanhHieu',
    password: '$2a$12$nAzd43e7zlE/dqGw4ubOCOcNqRfwNJhV2u4.bd9BAVvIexpPHiZMK', // $W3<a4Ujq+QTt75
    name: 'Thanh Hieu',
    id: '2133d32b'
  }
};

const validate = async(request, username, password) => {
  const user = users[username];
  if(!user) {
    return { credentials: null, isValid: false };
  }

  const isValid = await Bcrypt.compare(password, user.password);
  const credentials = { id: user.id, name: user.name };
  return { isValid, credentials };
};

const init = async () => {
  const server = Hapi.server({
    host: host,
    port: port,
    routes: {
      cors: {
        origin: ['http://127.0.0.1:5501'],
        header: ['Accept', 'Content-Type'],
        additionalHeaders: ['X-Requested-With'],
        credentials: true
      }
    }
  });

  await server.register(require('@hapi/basic'));

  server.auth.strategy('simple', 'basic', { validate });

  server.route({

  });

  server.route({
    method: 'GET', 
    path: '/api/students-attendance/{date}',
    handler: getAllStudentsAttendanceStatusHandler
  });

  server.route({
    method: 'GET', 
    path: '/api/students-attendance/{date}/{studentID}',
    handler: getOneStudentAttendanceStatusHandler
  });

  server.route({
    method: 'GET',
    path: '/api/students-attendance/{date}/{studentID*}',
    handler: getManyStudentAttendanceStatusHandler
  });

  server.route({
    method: 'POST',
    path: '/api/students-attendance', 
    options: {
      auth: 'simple'
    },
    handler: updateStudentsAttendanceStatusHandler
  });

  server.route({
    method: 'DELETE',
    path: '/api/students-attendance/{date}/{studentID}',
    handler: (request, h) => {
      return 'delete students-attendance-status'
    }
  });

  server.route({
    method: 'GET',
    path: '/api/students',
    handler: getAllStudentsHandler
  });

  server.route({
    method: 'GET',
    path: '/api/students/{studentID}',
    handler: getOneStudentHandler
  });

  server.route({
    method: 'GET',
    path: '/api/students/{studentID*}',
    handler: getManyStudentsHandler
  });

  server.route({
    method: 'POST',
    path: '/api/students',
    options: {
      auth: 'simple'
    },
    handler: addNewStudentHandler
  });

  server.route({
    method: 'DELETE',
    path: '/api/students/{studentID}',
    options: {
      auth: 'simple'
    },
    handler: deleteOneStudentHandler
  });

  server.route({
    method: 'DELETE',
    path: '/api/students/{studentID*}',
    options: {
      auth: 'simple'
    },
    handler: deleteManyStudentsHandler
  });

  server.route({
    method: '*',
    path: '/{any*}',
    handler: (request, h) => {
      return '404 Error! Page Not Found!';
    }
  });

  await server.start();
  console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});

init();