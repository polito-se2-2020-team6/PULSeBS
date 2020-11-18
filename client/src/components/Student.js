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

  bookSeat = (lectureId) => {
    this.setState({ bookingProgres: 1 });
    const id = [...this.state.authUser];
    console.log(id);
    const studentId = id.userId;
    API.bookLecture(lectureId, studentId)
      .then((lectures) => {
        this.setState({ bookingProgres: 0 });
      })
      .catch((err) => console.log(err));
  };

  componentDidMount() {
    API.isLogged()
      .then((user) => {
        this.setState({ authUser: user });
        console.log(this.state);
      })
      .catch((err) => {
        this.setState({ authErr: err.errorObj });
      });

    //getting list of all lectures
    // const studentId = this.state.authUser.userId;
    // API.getLectures(studentId)
    //   .then((lectures) => {
    //     this.setState({ lectures: lectures });
    //   })
    //   .catch((err) => console.log(err));
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
