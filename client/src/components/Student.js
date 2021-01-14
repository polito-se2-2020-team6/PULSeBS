import React, { Component } from "react";
import API from "../API/API";
import LectureList from "./Lectures";
import { AuthContext } from "../auth/AuthContext";

class Student extends Component {
  constructor(props) {
    super(props);
    this.state = {
      lectures: [],
      bookingProgres: 0,
      distincted: [],
      filtered: [],
      failedBooked: null,
    };
  }
  //let the student to book for a lecture
  bookSeat = (lectureId) => {
    this.setState({ bookingProgres: 1 });
    const studentId = this.props.user.userId;

    API.bookLecture(lectureId, studentId)
      .then((lectures) => {
        if (lectures.success === true) {
          this.setState({ bookingProgres: 0, failedBooked: 0 });
        } else if (lectures.success === false) {
          this.setState({ bookingProgres: 0, failedBooked: 1 });
        }
        this.componentDidMount();
      })
      .catch((err) => console.log(err));
  };

  //filtering lectures
  filterLectures = (courseId) => {
    let lectures = [...this.state.lectures];
    if (courseId === "all") {
      this.setState({ filtered: [] });
      this.componentDidMount();
    } else {
      let filtered = lectures.filter((cur) => {
        return cur.courseName === courseId;
      });

      const newLectures = filtered;
      this.setState({ filtered: newLectures });
    }
  };

  //cancel booking
  cancelBooking = (lectureId) => {
    this.setState({ bookingProgres: 1 });
    const studentId = this.props.user.userId;

    API.cancelBooking(lectureId, studentId)
      .then((lectures) => {
        this.componentDidMount();
        this.setState({ bookingProgres: 0 });
      })
      .catch((err) => console.log(err));
  };

  componentDidMount() {
    
    const studentId = window.location.href.split("=")[1];
    API.getLectures(studentId)
      .then((lectures) => {
        this.setState({ lectures: lectures });
        let courseNames = [];
        courseNames = lectures.map((lecture) => {
          return lecture.courseName;
        });
        let unique = [...new Set(courseNames)];

        this.setState({ distincted: unique });
      })
      .catch((err) => console.log(err));
  }

  render() {
    return (
      <AuthContext.Consumer>
        {(context) => (
          <>
            {context.authUser ? (
              <>
                <h1 className="mt-5 ml-3">Book Your Next Lectures</h1>
                <LectureList
                  lectures={this.state.lectures}
                  filterLectures={this.filterLectures}
                  bookSeat={this.bookSeat}
                  bookingProgres={this.state.bookingProgres}
                  cancelBooking={this.cancelBooking}
                  distincted={this.state.distincted}
                  filtered={this.state.filtered}
                  failedBooked={this.state.failedBooked}
                />
              </>
            ) : (
              <></>
            )}
          </>
        )}
      </AuthContext.Consumer>
    );
  }
}

export default Student;
