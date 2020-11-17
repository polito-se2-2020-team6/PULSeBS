import React, { Component } from "react";
import API from "../API/API";
import LectureList from "./Lectures";
import { AuthContext } from "../auth/AuthContext";
import { ROLES } from "../data/consts";

class Student extends Component {
  constructor(props) {
    super(props);
    this.state = {
    user : this.props.user ,  
    lectures: [],
    bookingProgres: 0
    }
  }

  // bookSeat = (lectureId) => {
  //   let lectures = this.state.lectures;
  //   this.setState({ bookingProgres: 1 });
  //   setTimeout(() => {
  //     const index = lectures.findIndex((l, index) => {
  //       if (l.lectureId === lectureId) {
  //         return index;
  //       }
  //     });
  //     lectures[index].bookedSelf = 1;
  //     this.setState({ lectures: lectures });
  //     this.setState({ bookingProgres: 0 });
  //   }, 1500);
  // };

  componentDidMount() {

    //getting list of all lectures
    const studentId = this.state.user.userId ;
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
