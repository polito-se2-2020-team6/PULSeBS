import Lecture from "./Lecture";
const baseURL = "/API/REST.php/api";

async function getAllLectures(userId) {
  let data = new Date();
  /////// xxxxxxxxxxxxxx   YYYY-dd-mm to modify ( also startST is wrong)
  let url = `/users/${userId}/lectures?startDate=${data.getUTCFullYear()}-${
    data.getMonth() + 1
  }-${data.getDate()}`;
  const response = await fetch(baseURL + url);
  const lectureJson = await response.json();
  if (response.ok) {
    const lectures = lectureJson.lectures;
    const final = lectures.map(
      (l) =>
        new Lecture(
          l.lectureId,
          l.courseId,
          l.startTS,
          l.endTS,
          l.online,
          l.roomName,
          l.totalSeats,
          l.bookedSeats,
          l.courseName,
          l.bookedSelf,
          l.teacherName
        )
    );
    return final;
  } else {
    let err = { status: response.status, errObj: lectureJson };
    throw err; // An object with the error coming from the server
  }
}
//return list of lectures based on the userId **GET** /api/users/{userId}/lectures
async function getLectures(userId) {
  let data = new Date();
  /////// xxxxxxxxxxxxxx   YYYY-dd-mm to modify ( also startST is wrong)
  let url = `/users/${userId}/lectures?startDate=${data.getUTCFullYear()}-${
    data.getMonth() + 1
  }-${data.getDate()}`;
  const response = await fetch(baseURL + url);
  const lectureJson = await response.json();
  if (response.ok) {
    const lectures = lectureJson.lectures;
    const final = lectures.map(
      (l) =>
        new Lecture(
          l.lectureId,
          l.courseId,
          l.startTS,
          l.endTS,
          l.online,
          l.roomName,
          l.totalSeats,
          l.bookedSeats,
          l.courseName,
          l.bookedSelf,
          l.teacherName,
          l.inWaitingList
        )
    );
    return final;
  } else {
    let err = { status: response.status, errObj: lectureJson };
    throw err; // An object with the error coming from the server
  }
}

//return list of lectures based on the userId **GET** /api/users/{userId}/lectures
async function getLecturesStartDate(userId) {
  let data = new Date();
  /////// xxxxxxxxxxxxxx   YYYY-dd-mm to modify ( also startST is wrong)
  let url = `/users/${userId}/lectures?startDate=${data.getUTCFullYear()}-${
    data.getMonth() + 1
  }-${data.getDate()}`;
  console.log("URL startDate");
  console.log(url);
  const response = await fetch(baseURL + url);
  const lectureJson = await response.json();
  if (response.ok) {
    const lectures = lectureJson.lectures;
    const final = lectures.map(
      (l) =>
        new Lecture(
          l.lectureId,
          l.courseId,
          l.startTS,
          l.endTS,
          l.online,
          l.roomName,
          l.totalSeats,
          l.bookedSeats,
          l.courseName,
          l.bookedSelf,
          l.teacherName
        )
    );
    return final;
  } else {
    let err = { status: response.status, errObj: lectureJson };
    throw err; // An object with the error coming from the server
  }
}

//API for stats
async function getStats(idLecture, idCourse, period, week, month, year) {
  let url = `/stats?lecture=${idLecture}&course=${idCourse}&period=${period}&week=${week}&month=${month}&year=${year}`;
  console.log(url);
  const response = await fetch(baseURL + url);
  const stats = await response.json();
  if (response.ok) {
    return stats;
  } else {
    let err = { status: response.status, errObj: stats };
    throw err; // An object with the error coming from the server
  }
}

//return list of lectures based on the userId with time filter **GET** /api/users/{userId}/lectures?[startDate=YYYY-mm-dd][endDate=YYYY-mm-dd]

//# Book a lecture /api/users/{userId}/book
async function bookLecture(lectureId, userId) {
  // return a new promise.
  return new Promise(function (resolve, reject) {
    // do the usual XHR stuff
    var req = new XMLHttpRequest();
    let url = baseURL + `/users/${userId}/book`;
    let data = `lectureId=${lectureId}`;
    req.open("post", url);
    //NOW WE TELL THE SERVER WHAT FORMAT OF POST REQUEST WE ARE MAKING
    req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    req.onload = function () {
      if (req.status === 200) {
        const response = req.response;
        let obj = JSON.parse(response);
        resolve(obj);
      } else {
        reject(Error(req.statusText));
      }
    };
    // handle network errors
    req.onerror = function () {
      reject(Error("Network Error"));
    }; // make the request
    req.send(data);
  });
}

//# Cancel a booking **DELETE** /api/users/{userId}/book
async function cancelBooking(lectureId, userId) {
  // return a new promise.
  return new Promise(function (resolve, reject) {
    // do the usual XHR stuff
    var req = new XMLHttpRequest();
    let url = baseURL + `/users/${userId}/book`;
    let data = `lectureId=${lectureId}`;
    req.open("delete", url);
    //NOW WE TELL THE SERVER WHAT FORMAT OF POST REQUEST WE ARE MAKING
    req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    req.onload = function () {
      if (req.status === 200) {
        const response = req.response;
        let obj = JSON.parse(response);
        resolve(obj);
      } else {
        reject(Error(req.statusText));
      }
    };
    // handle network errors
    req.onerror = function () {
      reject(Error("Network Error"));
    }; // make the request
    req.send(data);
  });
}

// Return list of students booked to a lecture **GET** /api/lectures/{lectureId}/students
async function getStudentsBooked(lectureId) {
  let url = "/lectures/";
  if (lectureId) {
    const queryParams = lectureId + "/students";
    url += queryParams;
  }
  console.log(url);
  const response = await fetch(baseURL + url);

  const studentsList = await response.json();
  if (response.ok) {
    return studentsList;
  } else {
    let err = { status: response.status, errObj: studentsList };
    throw err; // An object with the error coming from the server
  }
}

// Cancel a lecture **DELETE** /api/lectures/{lectureId}
async function deleteLecture(lectureId) {
  // don't know if this work
  // return a new promise.
  return new Promise(function (resolve, reject) {
    // do the usual XHR stuff
    var req = new XMLHttpRequest();
    let url = baseURL + `/lectures/${lectureId}`;
    let data = `lectureId=${lectureId}`;
    req.open("delete", url);
    //NOW WE TELL THE SERVER WHAT FORMAT OF POST REQUEST WE ARE MAKING
    req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    req.onload = function () {
      console.log(req);
      if (req.status === 200) {
        console.log("cipolla");
        const response = req.response;
        let obj = JSON.parse(response);
        resolve(obj);
      } else {
        console.log("carota");
        reject(Error(req.statusText));
      }
    };
    // handle network errors
    req.onerror = function () {
      console.log("cane");
      reject(Error("Network Error"));
    }; // make the request
    req.send(data);
  });
}

//Login **POST** /api/login

async function userLogin(username, password) {
  return new Promise(function (resolve, reject) {
    // do the usual XHR stuff
    var req = new XMLHttpRequest();
    let url = `${baseURL}/login`;
    let data = `username=${username}&password=${password}`;
    req.open("post", url);
    //NOW WE TELL THE SERVER WHAT FORMAT OF POST REQUEST WE ARE MAKING
    req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    console.log(req);
    req.onload = function () {
      console.log(req);
      const status = JSON.parse(req.response);
      // console.log(status.success);
      if (status.success === true) {
        const response = req.response;
        let user = JSON.parse(response);
        resolve(user);
      } else {
        console.log(status.success);
        reject(status.success);
      }
    };
    // handle network errors
    req.onerror = function () {
      reject(Error("Network Error"));
    }; // make the request
    req.send(data);
  });
}

//Meaning of field type **GET** /api/types

//Check login **GET** /api/logged
async function isLogged() {
  const response = await fetch(`${baseURL}/user/me`);
  const userJson = await response.json();
  // console.log(userJson.user.loggedIn);
  if (response.ok) {
    console.log(userJson);
    return userJson;
  } else {
    let err = { status: response.status, errObj: userJson };
    throw err; // An object with the error coming from the server
  }
}
async function turnLecture2(lectureId, online) {
  return new Promise((resolve, reject) => {
    fetch(baseURL + `/lectures/${lectureId}/online`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(true),
    })
      .then((response) => {
        if (response.ok) {
          resolve(null);
        } else {
          // analyze the cause of error
          response
            .json()
            .then((obj) => {
              reject(obj);
            }) // error msg in the response body
            .catch((err) => {
              reject({
                errors: [
                  { param: "Application", msg: "Cannot parse server response" },
                ],
              });
            }); // something else
        }
      })
      .catch((err) => {
        reject({ errors: [{ param: "Server", msg: "Cannot communicate" }] });
      }); // connection errors
  });
}
// let url = baseURL + `/lectures/${lectureId}/online`;
async function turnLecture(lectureId, online) {
  console.log(lectureId);
  console.log(online);
  return new Promise(function (resolve, reject) {
    // do the usual XHR stuff
    var req = new XMLHttpRequest();
    let url = baseURL + `/lectures/${lectureId}/online`;
    let data = `value=${!online}`;
    console.log(url);
    console.log(data);
    req.open("PATCH", url);
    //NOW WE TELL THE SERVER WHAT FORMAT OF POST REQUEST WE ARE MAKING
    req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    req.onload = function () {
      console.log(req);
      if (req.status === 200) {
        console.log("cipolla");
        const response = req.response;
        let obj = JSON.parse(response);
        resolve(obj);
      } else {
        console.log("carota");
        reject(Error(req.statusText));
      }
    };
    // handle network errors
    req.onerror = function () {
      console.log("cane");
      reject(Error("Network Error"));
    }; // make the request
    req.send(data);
  });
}

//Logout **POST** /api/logout
async function userLogout() {
  return new Promise((resolve, reject) => {
    fetch(baseURL + "/logout", {
      method: "POST",
    }).then((response) => {
      if (response.ok) {
        resolve(null);
      } else {
        // analyze the cause of error
        response
          .json()
          .then((obj) => {
            reject(obj);
          }) // error msg in the response body
          .catch((err) => {
            reject({
              errors: [
                { param: "Application", msg: "Cannot parse server response" },
              ],
            });
          }); // something else
      }
    });
  });
}

async function getStatesBookManager(idCourse) {
  let url = `/stats?course=${idCourse}`;
  console.log(url);
  const response = await fetch(baseURL + url);
  const stats = await response.json();
  if (response.ok) {
    return stats;
  } else {
    let err = { status: response.status, errObj: stats };
    throw err; // An object with the error coming from the server
  }
}

const API = {
  getLectures,
  userLogin,
  userLogout,
  isLogged,
  getStudentsBooked,
  deleteLecture,
  bookLecture,
  cancelBooking,
  turnLecture,
  turnLecture2,
  getLecturesStartDate,
  getStats,
  getAllLectures,
  getStatesBookManager,
};
export default API;
