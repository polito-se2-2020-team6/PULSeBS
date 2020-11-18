import Lecture from "./Lecture";
const baseURL = "/API/REST.php/api";

//return list of lectures based on the userId **GET** /api/users/{userId}/lectures
async function getLectures(userId) {
  let url = `/users/${userId}/lectures`;
  const response = await fetch(baseURL + url);
  const lectureJson = await response.json();
  if (response.ok) {
    const lectures = lectureJson.lectures;
    const final = lectures.map((l) => new Lecture(l.lectureId, l.courseId, l.startTS, l.endTS, l.online, l.roomName, l.totalSeats, l.bookedSeats, l.courseName, l.bookedSelf, l.teacherName))
    return(final);
  } else {
    let err = { status: response.status, errObj: lectureJson };
    throw err; // An object with the error coming from the server
  }
}

//return list of lectures based on the userId with time filter **GET** /api/users/{userId}/lectures?[startDate=YYYY-mm-dd][endDate=YYYY-mm-dd]

//# Book a lecture /api/users/{userId}/book
async function bookLecture(lectureId,userId) {
  // return a new promise.
  return new Promise(function (resolve, reject) {
    // do the usual XHR stuff
    var req = new XMLHttpRequest();
    let url = baseURL + `users/${userId}/book`;
    let data = `lectureId=${lectureId}`;
    req.open("post", url);
    //NOW WE TELL THE SERVER WHAT FORMAT OF POST REQUEST WE ARE MAKING
    req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    req.onload = function () {
      if (req.status === 200) {
        const response = req.response;
        let obj = JSON.parse(response);
        console.log(obj)
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

// Return list of students booked to a lecture **GET** /api/lectures/{lectureId}/students
async function getStudentsBooked(lectureId) {
  let url = "/lectures/";
  if (lectureId) {
    const queryParams = lectureId + "/students";
    url += queryParams;
  }
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
  return new Promise((resolve, reject) => {
    fetch(baseURL + "/lectures/" + lectureId, {
      method: "DELETE",
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
    req.onload = function () {
      if (req.status === 200) {
        const response = req.response;
        let user = JSON.parse(response);
        resolve(user);
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

//Meaning of field type **GET** /api/types

//Check login **GET** /api/logged
async function isLogged() {
  const response = await fetch(`${baseURL}/logged`);
  const userJson = await response.json();
  console.log(userJson.user.loggedIn);
  if (response.ok) {
    return userJson;
  } else {
    let err = { status: response.status, errObj: userJson };
    throw err; // An object with the error coming from the server
  }
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

const API = {
  getLectures,
  userLogin,
  userLogout,
  isLogged,
  getStudentsBooked,
  deleteLecture,
  bookLecture
};
export default API;
