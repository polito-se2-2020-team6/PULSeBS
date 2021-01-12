import React from "react";
import API from "../../API/API";
import { Redirect } from "react-router-dom";
import {
    Col,
    Container,
    Row,
    Accordion,
    Card,
    Button
  } from "react-bootstrap";
  import { AuthContext } from "../../auth/AuthContext";

  class RecordPresence extends React.Component {
    constructor(props) {
      super(props);
  
      this.state = {
        authUser: {},
        students: [],
        lectures: []
      };
      this.wrapper = React.createRef();
    } 
    
    async componentDidMount() {
        await this.isLogged();
        this.getLectures(this.state.authUser.userId);
      }

      isLogged = async () => {
        const response = await API.isLogged();
        try {
          this.setState({ authUser: response, authErr: null });
        } catch (errorObj) {
          this.props.history.push("/login");
        }
      };

      getLectures = (userId) => {
        API.getLecturesStartDate(userId) //qua devi prendere solo  le lezioni di oggi
          .then((lectures) => {
            this.setState({
              lectures: lectures.filter((l) => new Date(l.startTS) < new Date()) || [] 
            });
            
            if (this.state.lectures.lenght){
                this.getStudentsBooked(this.state.lectures[0].lectureId)
            }
            
          })
          .catch((errorObj) => {
            console.log(errorObj);
          });
          
      };

      getStudentsBooked(lectureId) {
        API.getStudentsBooked(lectureId)
          .then((students) => {
            this.setState({
              students: students.students || [],
            });
            console.log(students.students)
          })
          .catch((errorObj) => {
            console.log(errorObj);
          });
      }

      setAttendance(lectureId, studentId, attended) {
        API.setAttendance(lectureId, studentId, attended)
          .then((response) => {
            //bo guarda se è true
            console.log(response)
          })
          .catch((errorObj) => {
            console.log(errorObj);
          });
      }

      render() {
        return (
          <AuthContext.Consumer>
            {(context) => (
              <>
                {context.authUser === null && <Redirect to="/login"></Redirect>}
                <Container className = "mt-3">
                <Row className="justify-content-md-center mb-3"><h5>Click on the lectures to record the presences</h5></Row>
                <Accordion defaultActiveKey="0" id="acc">
                
                {this.state.lectures?.map((l) => (
                    <Card id="ca" key={l.lectureId}>      
                        <Accordion.Toggle as={Card.Header} id="acc1" eventKey={l.lectureId} onClick={() => this.getStudentsBooked(l.lectureId)}> {//qua fai onclick getstudentsbooked e li rappresenti
                    }
                    {l.startTS + " - " + l.courseName} 
                    </Accordion.Toggle>
                    <Accordion.Collapse eventKey={l.lectureId} id="acc2">
                    <Card.Body id="cab">
                        {this.state.students?.map((s) =>(
                            //qua in realta devi fare vedere il bottone presente solo se non lhai gia segnato presente
                        <Row className="mt-1" key={s.studentId}>
                        <Col>{s.studentName}  
                        {!s.attended?<Button variant="success" className="ml-2" id="but" size="sm" onClick={() => this.setAttendance(l.lectureId, s.studentId, 1)}>Present</Button>
                        :<Button variant="danger" className="ml-2" id="but" size="sm" onClick={() => this.setAttendance(l.lectureId, s.studentId, 0)}>Not Present</Button>}
                        </Col></Row>
                        ) )}
                    </Card.Body>
                    </Accordion.Collapse>
                </Card>          
                                  ))}
                </Accordion>
                </Container>
              </>
            )}
          </AuthContext.Consumer>
        );
      }
    }
    
    RecordPresence.contextType = AuthContext;
    export default RecordPresence;
    