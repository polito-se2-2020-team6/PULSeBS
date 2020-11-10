import Lecture from "./Lecture";
const baseURL = "/api";

//return list of lectures based on the userId **GET** /api/users/{userId}/lectures
async function getLectures(userId) {
  let url = `/users/${userId}/lectures`;
  const response = await fetch(baseURL + url);
  const lectureJson = await response.json();
  if (response.ok) {
    //return lectureJson.map((s) => new Lecture(s.lectureId, s.courseId, s.courseName, s.startTS, s.endTS, s.online, s.teacherName, s.roomName, s.bookedSeats, s.totalSeats, s.bookedSelf));
    //let lectures = new Lecture(1, 3, 'Data Science', '2020', '2021', '0', 'Hesam', '25', '12', '30', '1');
    let lectures = "HELLLLLOOO";
    return lectures;
  } else {
    let err = { status: response.status, errObj: lectureJson };
    throw err; // An object with the error coming from the server
  }
}

//return list of lectures based on the userId with time filter **GET** /api/users/{userId}/lectures?[startDate=YYYY-mm-dd][endDate=YYYY-mm-dd]

//# Book a lecture /api/users/{userId}/book

//# Cancel a booking **DELETE** /api/users/{userId}/book

// Cancel a lecture **DELETE** /api/lectures/{lectureId}

//Login **POST** /api/login

async function userLogin(username, password) {
  return new Promise((resolve, reject) => {
    fetch(baseURL + "/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username,
        password: password,
      }),
    })
      .then((response) => {
        if (response.ok) {
          response.json().then((user) => {
            resolve(user);
          });
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

//Meaning of field type **GET** /api/types

//Check login **GET** /api/logged

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

const API = { getLectures, userLogin, userLogout };
export default API;
