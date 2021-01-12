import React, { Component } from "react";
import { AuthContext } from "../auth/AuthContext";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import Accordion from "react-bootstrap/Accordion";
import Card from "react-bootstrap/Card";
import { Redirect } from "react-router-dom";
import API from "../API/API";
import Form from "react-bootstrap/Form";
import FormControl from "react-bootstrap/FormControl";
import Col from "react-bootstrap/Col";
import EditLectures from "./EditLectures";

class ScheduleEdit extends Component {
  constructor(props) {
    super(props);
    this.state = {
      courses: [],
      lectures: [],
    };
  }
  getLectures = (courseId) => {
    API.getAllLecturesSO(courseId)
      .then((lectures) => {
        this.setState({ lectures: lectures });
        console.log(this.state.lectures);
      })
      .catch((err) => console.log(err));
  };

  componentDidMount() {
    API.getAllCoursesSO()
      .then((courses) => {
        this.setState({ courses: courses });
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
                <h1 className="m-4">Edit Schedule of Courses</h1>
                <Accordion>
                  {/* <Tabs id="uncontrolled-tab-example"> */}
                  {this.state.courses.map((course) => {
                    return (
                      <Card>
                        <Accordion.Toggle className="courseTitle" as={Card.Header} eventKey={course.id}>
                          Course Name : {course.name} , Course Code : {course.code}
                        </Accordion.Toggle>
                        <Accordion.Collapse eventKey={course.id}>
                          <Card.Body>
                          <EditLectures
                          courseId={course.id}
                          courseName={course.name}
                        />
                          </Card.Body>
                        </Accordion.Collapse>
                      </Card>
                      // <Tab
                      //   eventKey={course.id}
                      //   title={course.name}
                      // >
                        
                      // </Tab>
                    );
                  })}
                </Accordion>
                {/* </Tabs> */}
              </>
            ) : (
              <>
                <Redirect to="/login" />
              </>
            )}
          </>
        )}
      </AuthContext.Consumer>
    );
  }
}
// function GetLectures(props) {}

export default ScheduleEdit;
