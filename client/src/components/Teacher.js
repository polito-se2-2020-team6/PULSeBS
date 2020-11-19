// filtro fatto su courseName invece che coureId, se cancelli tutte le lezioni 
// scompare la tab

import React, { useState } from "react";
import  { Redirect } from 'react-router-dom'
import {
  Col,
  Container,
  Row,
  Tabs,
  Tab,
  ListGroup,
  Button,
} from "react-bootstrap";
import { AuthContext } from "../auth/AuthContext";
import API from ".././API/API";

/*  listaLezione -> getLectures
    corso -> courseId
    lezione -> lectureId
    studenti -> vector of Students


var listaLezioni = [
  {
    corso: "History",
    lezione: "HY-01",
    studenti: new Array("ettore", "carlo", "luca", "camarcorlo"),
  },
  {
    courseId: "History",
    lectureId: "HY-01",
    studenti: new Array("ettore", "carlo", "luca", "camarcorlo"),
  },
  {
    courseId: "Geometry",
    lectureId: "GY-01",
    studenti: new Array("ettore", "carlo"),
  },
  {
    courseId: "History",
    lectureId: "HY-02",
    studenti: new Array("ettore", "camarcorlo"),
  },
  {
    courseId: "Software Engineering 2",
    lectureId: "SE2-01",
    studenti: [],
  },
  {
    courseId: "Software Engineering 2",
    lectureId: "SE2-02",
    studenti: new Array("Marco", "Luca"),
  },
  {
    courseId: "Analisi",
    lectureId: "AI-01",
    studenti: new Array("ludo", "carlo", "max"),
  },
]; */

class Teacher extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      lectureUpdated: true,
      totalLectures: [],
      course: '',
      students: [],
      lecture: '',
      studtable: true,
    };
  }

  getLectures = (userId) => {
    API.getLectures(userId)
      .then((lectures) => {
        console.log(lectures);
        this.setState({
          totalLectures: lectures || [],
        });
      })
      .catch((errorObj) => {
        console.log(errorObj);
      });
  };

  getStudentsBooked(lectureId) {
    API.getStudentsBooked(lectureId)
      .then((students) => {
          console.log(students);
        this.setState({
          students: students.students || [],
        });
      })
      .catch((errorObj) => {
        console.log('no');
        console.log(errorObj);
      });
  }

  //delete a lecture as teacher
  async deleteLecture(lectureId) {
    API.deleteLecture(lectureId)
      .then(() => {
        this.setState({totalLectures : this.state.totalLectures.filter(c => c.lectureId !== lectureId)});
        //aggiunto io
        this.setState({students : []});
        this.setState({studtable: false});
      })
      .catch((errorObj) => {
        console.log(errorObj);
      });
      //console.log("prima");
      //console.log(this.state.totalLectures);
      //console.log(this.state.students);
      await this.setState({totalLectures : this.state.totalLectures.filter(c => c.lectureId !== lectureId)});
      await this.setState({students : []})
      //console.log("dopo");
      //console.log(this.state.totalLectures);
      //console.log(this.state.students);
      
  }

  updateLectures(userId) {
    if (this.state.lectureUpdated) {
      this.setState({ lectureUpdated: false });
      this.getLectures(userId);
    }
  }

  clearStudentTable() {
    this.setState({students : []})
  }

  render() {
    const corsi = this.state.totalLectures
      .map((item) => item.courseName)
      .filter((v, i, s) => s.indexOf(v) === i);

    return (
      <AuthContext.Consumer>
        {(context) => (
            <>
            {context.authUser ? (
          <>
            {this.updateLectures(context.authUser.userId)}

            <Container fluid className="mt-5 ">
              <Row className="justify-content-md-center">
                <h1>Welcome back</h1>
              </Row>

              <Tabs
                defaultActiveKey={this.state.totalLectures[0]?.courseId}
                id="noanim-tab-example"
                onSelect={() => this.clearStudentTable()}
              >
                {corsi?.map((C_Id) => (
                  <Tab eventKey={C_Id} title={C_Id} key={C_Id}>
                    <Row className="mt-5 ">
                      <Col md={1}></Col>
                      <Col md={4}>
                        <Tab.Container id="list-group-tabs-example">
                          <ListGroup className="mt-2">
                            <ListGroup.Item as="li" active>
                              <h3>lecture</h3>
                            </ListGroup.Item>

                            {this.state.totalLectures
                              .filter((l) => l.courseName === C_Id)
                              ?.map((c) => (
                                <ListGroup.Item
                                  action
                                  variant={
                                    c.lectureId === this.state.lecture
                                      ? "primary"
                                      : "light"
                                  }
                                  key={c.lectureId}
                                  onClick={() => {
                                    this.setState({
                                      course: c.courseId,
                                      lecture: c.lectureId,
                                      studtable: true,
                                    });
                                    this.getStudentsBooked(c.lectureId);
                                  }}
                                >
                                  {c.startTS}

                                  <Button
                                    type="button"
                                    className="close"
                                    aria-label="Close"
                                    onClick={() => {
                                      this.deleteLecture(c.lectureId);
                                    }}
                                  >
                                    <span aria-hidden="true">&times;</span>
                                  </Button>
                                </ListGroup.Item>
                                
                              ))}
                          </ListGroup>
                        </Tab.Container>
                      </Col>
                      <Col md={1}></Col>
                      <Col md={4}>
                      {this.state.studtable?
                        <ListGroup as="ul" className="mt-2">
                          <ListGroup.Item as="li" active>
                            <h3>students booked</h3>
                          </ListGroup.Item>
                          
                          
                            {this.state.students.length?
                                    <ListGroup.Item ><h5>number of students:
                                          {" "}{this.state.students.length}</h5>
                                      </ListGroup.Item>:
                                      <></>
                            }
                            {this.state.students?.map((s) => (
                              <ListGroup.Item as="li" key={s}>
                                {"S"+s.studentId + " - " +s.studentName}
                              </ListGroup.Item>
                            ))}
                          



                        </ListGroup>:
                        <ListGroup>
                          <ListGroup.Item as="li" active>
                            <h3>students booked</h3>
                          </ListGroup.Item>
                      </ListGroup>
                        }
                        
                      </Col>
                    </Row>
                  </Tab>
                ))}
              </Tabs>
            </Container>
          </>
          ) : (
            <><Redirect to='/login'  /></>
          )}
        </>
        )}
      </AuthContext.Consumer>
    );
  }
}


export default Teacher;
