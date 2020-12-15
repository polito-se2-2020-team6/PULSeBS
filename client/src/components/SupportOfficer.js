import React, { Component } from "react";
import API from "../API/API";
import { AuthContext } from "../auth/AuthContext";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import Upload from "./Upload"
class SupportOfficer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      lectures: [],
      bookingProgres: 0,
      distincted: [],
      filtered: [],
    };
  }
  //let the student to book for a lecture
  bookSeat = (lectureId) => {
    this.setState({ bookingProgres: 1 });
    const studentId = this.props.user.userId;
    console.log(studentId);
    API.bookLecture(lectureId, studentId)
      .then((lectures) => {
        this.componentDidMount();
        this.setState({ bookingProgres: 0 });
        console.log(lectures);
      })
      .catch((err) => console.log(err));
  };

  //filtering lectures
  filterLectures = (courseId) => {
    let lectures = [...this.state.lectures];
    if (courseId === "all") {
      this.setState({ filtered: [] });
      console.log(this.state.filtered);
      console.log(this.state.lectures);
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
        console.log(unique);
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
              <h1 className="m-4">Upload CSV Files</h1>
                <Tabs defaultActiveKey="students" id="uncontrolled-tab-example">
                  <Tab eventKey="students" title="Students">
                    <Upload section="Student"/>
                  </Tab>
                  <Tab eventKey="courses" title="Courses">
                    <Upload section="Courses"/>
                  </Tab>
                  <Tab eventKey="teachers" title="Teachers">
                    <Upload section="Teachers"/>
                  </Tab>
                  <Tab eventKey="lectures" title="Lectures">
                    <Upload section="Lectures"/>
                  </Tab>
                  <Tab eventKey="classes" title="Classes">
                    <Upload section="Classes"/>
                  </Tab>
                </Tabs>
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

export default SupportOfficer;
