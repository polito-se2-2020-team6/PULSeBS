class LectureSO {
  constructor(
    lectureId,
    courseId,
    startTS,
    endTS,
    online,
    roomName,
    totalSeats,
    bookedSeats,
    courseName,
    bookedSelf,
    teacherName,
    inWaitingList
  ) {
    const getWeekDay = (ts)=>{
      const unixTimestamp = ts;
      const milliseconds = unixTimestamp * 1000; // 1575909015000
      const dateObject = new Date(milliseconds);
      const weekday = dateObject.getDay() + 1;
      return weekday;
    };

    const convertTS = (ts) => {
      const unixTimestamp = ts;
      const milliseconds = unixTimestamp * 1000; // 1575909015000
      const dateObject = new Date(milliseconds);
      const humanDateFormat = dateObject.toLocaleString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
      }); //2019-12-9 10:30:15
      
      return humanDateFormat;
    };

    this.lectureId = lectureId;
    this.courseId = courseId;
    this.courseName = courseName;
    this.startTS = convertTS(startTS);
    this.endTS = convertTS(endTS);
    this.weekday = getWeekDay(startTS);
    this.online = online;
    this.teacherName = teacherName;
    this.roomName = roomName;
    this.bookedSeats = bookedSeats;
    this.totalSeats = totalSeats;
    this.bookedSelf = bookedSelf;
    this.inWaitingList = inWaitingList;
  }

  /**
   * Construct a Counter from a plain object
   * @param {{}} json
   * @return  lecture} the newly created lecture object
   */
  static from(json) {
    const l = Object.assign(new LectureSO(), json);
    return l;
  }
}

export default LectureSO;
