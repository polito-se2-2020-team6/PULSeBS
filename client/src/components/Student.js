import React, { Component } from "react";
import API from "../API/API";
import LectureList from "./Lectures";

class Student extends Component {
  state = {
<<<<<<< HEAD
    lectures: [],
=======
<<<<<<< HEAD
    lectures: [
      {
        lectureId: 1,
        courseId: 12,
        courseName: "Data",
        startTS: 2020,
        endTS: 2021,
        online: 0,
        teacherName: "Hesam",
        roomName: 21,
        bookedSeats: 12,
        totalSeats: 33,
        bookedSelf: 1,
      },
      {
        lectureId: 2,
        courseId: 32,
        courseName: "SE2",
        startTS: 2020,
        endTS: 2021,
        online: 0,
        teacherName: "Mehrdad",
        roomName: 12,
        bookedSeats: 44,
        totalSeats: 100,
        bookedSelf: 0,
      },
    ],
=======
    lectures: [],
>>>>>>> 82ff2d9825ecfbc4906c126487fb09b01544b6ef
>>>>>>> bf1640da39f742f265ceebf045f69c0b30dd4d8a
    bookingProgres: 0,
  };

  bookSeat = (lectureId) => {
    let lectures = this.state.lectures;
    this.setState({ bookingProgres: 1 });
    setTimeout(() => {
      const index = lectures.findIndex((l, index) => {
        if (l.lectureId === lectureId) {
          return index;
        }
      });
      lectures[index].bookedSelf = 1;
      this.setState({ lectures: lectures });
      this.setState({ bookingProgres: 0 });
    }, 1500);
  };

  componentDidMount() {
<<<<<<< HEAD
=======
<<<<<<< HEAD
    // //getting list of all lectures
    // const studentId = 2;
    // API.getLectures(studentId)
    //   .then((lectures) => {
    //     this.setState({ lectures : lectures });
    //   })
    //   .catch((err) => console.log(err));
=======
>>>>>>> bf1640da39f742f265ceebf045f69c0b30dd4d8a
    //getting list of all lectures
    const studentId = 1;
    API.getLectures(studentId)
      .then((lectures) => {
        this.setState({ lectures : lectures });
      })
      .catch((err) => console.log(err));
<<<<<<< HEAD
=======
>>>>>>> 82ff2d9825ecfbc4906c126487fb09b01544b6ef
>>>>>>> bf1640da39f742f265ceebf045f69c0b30dd4d8a
  }

  render() {
    return (
      <>
        <h1>Student Page</h1>
        <button type="button" className="btn btn-primary">
          Book A Seat
        </button>
        <button type="button" className="btn btn-success">
          Upcoming Lectures
        </button>
        <LectureList
          lectures={this.state.lectures}
          bookSeat={this.bookSeat}
          bookingProgres={this.state.bookingProgres}
        />
      </>
    );
  }
}

export default Student;
