import React, { Component } from "react";
import API from "../API/API";

class Student extends Component {
  state = {
    lectures: [],
  };

  componentDidMount() {
    // //getting list of all lectures
    // const studentId = 2;
    // API.getLectures(studentId)
    //   .then((lectures) => { 
    //     this.setState({ lectures : lectures });
    //   })
    //   .catch((err) => console.log(err));
    const fakeObj = {
      lectureId: 1,
      courseId: 12,
      courseName: "Data",
      startTS: "2020",
      endTS: "2021",
      online: 0,
      teacherName: "hesam",
      roomName: 21,
      bookedSeats: 12,
      totalSeats: 33,
      bookedSelf: 1
    };
    this.setState({ lectures: fakeObj });
  }

  render() {
    return (
      <>
        <h1>Student Page</h1>
        <button type="button" class="btn btn-primary">
          Book A Seat
        </button>
        <button type="button" class="btn btn-success">
          Upcoming Lectures
        </button>
        {this.state.lectures.map((lecture) => (
                    <h1>{lecture.courseName}</h1>
                  ))}
      </>
    );
  }
}

export default Student;
