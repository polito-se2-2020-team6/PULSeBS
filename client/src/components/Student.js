import React, { Component } from "react";
import API from "../API/API";
import LectureList from "./Lectures";

class Student extends Component {
  state = {
    lectures: [],
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
    //getting list of all lectures
    const studentId = 1;
    API.getLectures(studentId)
      .then((lectures) => {
        this.setState({ lectures : lectures });
      })
      .catch((err) => console.log(err));
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
