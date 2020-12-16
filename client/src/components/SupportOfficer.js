import React, { Component } from "react";
import { AuthContext } from "../auth/AuthContext";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import Upload from "./Upload"
class SupportOfficer extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
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
                  <Tab eventKey="teachers" title="Teachers">
                    <Upload section="Teachers"/>
                  </Tab>
                  <Tab eventKey="courses" title="Courses">
                    <Upload section="Courses"/>
                  </Tab>
                  <Tab eventKey="enrollments" title="Enrollments">
                    <Upload section="Enrollments"/>
                  </Tab>
                  <Tab eventKey="schedules" title="Schedules">
                    <Upload section="Schedules"/>
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
