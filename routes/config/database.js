//테스트 DB
var _mysql = {
  host: '127.0.0.1',
  port: '3306',
  user: 'root',
  password:'work1801!',
  database:'odms',
  multipleStatements:true //다중 퀄리 사용가능
}

//운영 DB
//  var _mysql = {
//   host: '119.207.78.144',
//   port: 13336,
//   user: 'open_m',
//   password: '*man(2019)',
//   database: 'odms',
//   multipleStatements:true //다중 퀄리 사용가능
//  }

// //개발 DB
// var _mysql = {
//   host: '192.168.0.39',
//   port: '3306',
//   user: 'root',
//   password:'work1801!',
//   database:'odms',
//   multipleStatements:true //다중 퀄리 사용가능
// }

// //개발 DB
// var _mysql = {
//   host: '192.168.0.41',
//   port: '3306',
//   user: 'odms_dev',
//   password:'work1801!',
//   database:'odms',
//   multipleStatements:true //다중 퀄리 사용가능
// }
  

module.exports = _mysql
