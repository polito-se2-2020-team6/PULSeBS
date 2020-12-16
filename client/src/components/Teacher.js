
import React from "react";
import moment from "moment";
import Pagination from 'react-bootstrap/Pagination'
import  { Redirect } from 'react-router-dom'
import {
  Col,
  Container,
  Row,
  Tabs,
  Tab,
  ListGroup
} from "react-bootstrap";
import { AuthContext } from "../auth/AuthContext";
import API from ".././API/API";
import DialogAlert from "./DialogAlert"


const view = 5; //number of lectures per pagination

class Teacher extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      totalLectures: [],
      course: '',
      students: [],
      lecture: '',
      studtable: true,
      online: false,
      range: 0,
      user: {},
    };
    this.wrapper = React.createRef();
  }


  async componentDidMount(){
    await this.isLogged();
    this.getLectures(this.state.user.userId)

  }
  isLogged = async () => {
    const response = await API.isLogged();
    try {
      this.setState({ user: response});
      
    } catch (errorObj) {
      this.props.history.push("/login");
    }
  };

  getLectures = (userId) => {
    API.getLecturesStartDate(userId)
      .then((lectures) => {
        this.setState({
          totalLectures: lectures || [],
        });
      })
      .catch((errorObj) => {
        console.log(errorObj);
      });
  };

  getStudentsBooked(lectureId, online) {
    API.getStudentsBooked(lectureId)
      .then((students) => {
        this.setState({
          students: students.students || [],online: online
        });
      })
      .catch((errorObj) => {
        console.log(errorObj);
      });
  }

  //delete a lecture as teacher
  deleteLecture(lectureId) {
    API.deleteLecture(lectureId)
      .then(() => {
        this.getLectures(this.context.authUser.userId)
        this.setState({students : []});
        this.setState({studtable: false});
      })
      .catch((errorObj) => {
        console.log(errorObj);
      });      
  }

  updateLectures(userId) {
      this.getLectures(userId);

  }

  clearStudentTable() {
    this.setState({students : []})
  }

  turnLecture(lectureId,online_s){
    //chiamata API per modificare stato lezione online/in presence
    API.turnLecture(lectureId,online_s)
    .then(() => {
      this.getLectures(this.context.authUser.userId)
      
    })
    .catch((errorObj) => {
      console.log(errorObj);
    });}

   changeRange(x,courseId){
     var range=this.state.range; //range va da 1 a x in base a quanto seleziono  1->0-9     2->10-19   ecc
     var lung= this.state.totalLectures.filter(l => l.courseName === courseId).length;
     if(x<0){
       if(this.state.range-1>=0) {range--}   
     }
     else if(x>0){
      if((this.state.range+1)<(Math.ceil(lung/view))){range++} 
    }
     this.setState({range: range});
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
            

            <Container fluid className="mt-5 ">
              <Row className="justify-content-md-center">
                <h1>Welcome back {this.state.user.firstname+" "+this.state.user.lastname}</h1>
              </Row>

              <Tabs
                defaultActiveKey={this.state.totalLectures[0]?.courseId}
                id="noanim-tab-example"
                onSelect={() => {this.clearStudentTable(); this.setState({range: 0})}}
              >
                {corsi?.map((C_Id) => (
                  <Tab eventKey={C_Id} title={C_Id} key={C_Id} >
                    <Row className="mt-5 ">
                      <Col md={1}></Col>
                      <Col md={5}>
                      <Pagination id="pagId">
                      
                      <Pagination.Prev onClick={() => this.changeRange(-1,C_Id)} id="pagPrevId"/>
                      <Pagination.Item disabled>{this.state.range+1}</Pagination.Item>
                      
                      <Pagination.Next onClick={() => this.changeRange(+1,C_Id)} id="pagNextId"/>

                    </Pagination>
                        <Tab.Container id="list-group-tabs-example">
                          <ListGroup className="mt-2" id="lgId2">
                            <ListGroup.Item as="li" active>
                              <h3>lecture</h3>
                            </ListGroup.Item>

                            {this.state.totalLectures
                              .filter((l) => l.courseName === C_Id)
                              ?.slice(this.state.range*view,this.state.range*view+view)
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
                                    this.getStudentsBooked(c.lectureId,c.online);
                                  }}
                                >
                                  <Row>
                                <Col md={2}>{moment(c.startTS).format("DD/MM/YYYY HH:mm")}</Col><Col>{c.online? "Virtual Lesson":c.roomName}</Col>
                                {   c.online? <></> :
                                  <DialogAlert 
                                  id="alID"
                                  dialog={"turn"}
                                  courseName={C_Id}
                                  startTS={c.startTS}
                                  lectureId={c.lectureId}
                                  onConfirm={(lectureId)=>{this.turnLecture(lectureId)}} />
                                    }
                                    <Col></Col>
                                  
                                  <DialogAlert 
                                  id="alID1"
                                  dialog={"delete"}
                                  courseName={C_Id}
                                  startTS={c.startTS}
                                  deleteLecture={this.deleteLecture}
                                  lectureId={c.lectureId}
                                  onConfirm={(lectureId)=>{this.deleteLecture(lectureId)}} />
                                  
                                  </Row>
                                </ListGroup.Item>
                                
                              ))}
                          </ListGroup>
                        </Tab.Container>
                      </Col>
                      <Col md={1}></Col>
                      <Col md={4}>
                      {this.state.studtable?
                        <ListGroup as="ul" className="mt-2" id="lgId">
                            {(this.state.students.length&&!this.state.online)?

                                    <><ListGroup.Item as="li" active>
                                    <h3>students booked</h3>
                                  </ListGroup.Item>
                                    <ListGroup.Item ><h5>number of students:
                                          {" "}{this.state.students.length}</h5>
                                      </ListGroup.Item>
                                      {this.state.students?.map((s) => (
                              <ListGroup.Item as="li" key={s}>
                                {"S"+s.studentId + " - " +s.studentName}
                              </ListGroup.Item>
                            ))}
                                      </>:
                                      <></>
                            }
                            
                          </ListGroup>:
                        <></>
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
Teacher.contextType = AuthContext;


export default Teacher;
