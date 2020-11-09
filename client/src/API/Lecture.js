class Lecture {
    constructor(lectureId, courseId, courseName, startTS, endTS, online, teacherName, roomName, bookedSeats, totalSeats, bookedSelf ) {
      this.lectureId = lectureId;
      this.courseId = courseId;
      this.courseName = courseName;
      this.startTS = startTS;
      this.endTS = endTS;
      this.online = online;
      this.teacherName = teacherName;
      this.roomName = roomName;
      this.bookedSeats = bookedSeats;
      this.totalSeats = totalSeats;
      this.bookedSeats = bookedSeats;
    }
  
    /**
     * Construct a Counter from a plain object
     * @param {{}} json
     * @return  lecture} the newly created lecture object
     */
    static from(json) {
      const l = Object.assign(new lecture(), json);
      return l;
    }
  }
  
  export default Lecture;