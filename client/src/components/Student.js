import React, { Component } from "react";
import API from "../API/API";
import LectureList from "./Lectures";
import { AuthContext } from "../auth/AuthContext";
import { ROLES } from "../data/consts";

class Student extends Component {
  constructor(props) {
    super(props);
    this.state = {
      lectures: [],
      bookingProgres: 0,
    };
  }
//let the student to book for a lecture
  bookSeat = (lectureId) => {
    this.setState({ bookingProgres: 1 });
    const studentId = this.props.user.userId;
    console.log(studentId);
    API.bookLecture(lectureId, studentId)
      .then((lectures) => {
        this.setState({ bookingProgres: 0 });
      })
      .catch((err) => console.log(err));
  };


  //cancel booking
  cancelBooking = (lectureId) => {
    this.setState({ bookingProgres: 1 });
    const studentId = this.props.user.userId;
    console.log(studentId);
    console.log(lectureId)
    API.cancelBooking(lectureId, studentId)
      .then((lectures) => {
        this.setState({ bookingProgres: 0 });
        console.log(lectures)
      })
      .catch((err) => console.log(err));
  };

  componentDidMount() {
    // API.isLogged()
    //   .then((user) => {
    //     this.setState({ authUser: user });
    //     console.log(this.state);
    //   })
    //   .catch((err) => {
    //     this.setState({ authErr: err.errorObj });
    //   });

    //getting list of all lectures
    const studentId = this.props.user.userId;
    API.getLectures(studentId)
      .then((lectures) => {
        this.setState({ lectures: lectures });
      })
      .catch((err) => console.log(err));
  }

  //after booking update the state
  componentDidUpdate() {
    const studentId = this.props.user.userId;
    API.getLectures(studentId)
      .then((lectures) => {
        this.setState({ lectures: lectures });
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
                <h1 className="mt-5 ml-">Book Your Next Lectures</h1>
                <LectureList
                  lectures={this.state.lectures}
                  bookSeat={this.bookSeat}
                  bookingProgres={this.state.bookingProgres}
                  cancelBooking={this.cancelBooking}
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
