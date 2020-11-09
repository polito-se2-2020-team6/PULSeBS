import Lecture from './Lecture';
const baseURL = "/api";

//return list of lectures based on the userId
async function getLectures(userId) {
    let url = `/users/${userId}/lectures`;
    const response = await fetch(baseURL + url);
    const lectureJson = await response.json();
    if (response.ok) {
      return lectureJson.map((s) => new Lecture(s.lectureId, s.courseId, s.courseName, s.startTS, s.endTS, s.online, s.teacherName, s.roomName, s.bookedSeats, s.totalSeats, s.bookedSelf));
    } else {
      let err = { status: response.status, errObj: lectureJson };
      throw err; // An object with the error coming from the server
    }
  }





const API = {getLectures};
export default API;