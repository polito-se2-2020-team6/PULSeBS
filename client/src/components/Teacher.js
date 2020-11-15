import React from "react";
import { Col, Container, Row, Tabs, Tab, ListGroup } from "react-bootstrap";
import { AuthContext } from "../auth/AuthContext";

/*  listaLezione -> getLectures 
    corso -> courseId
    lezione -> lectureId
    studenti -> vector of Students
*/

var listaLezioni = [{
    corso: "History",
    lezione: "HY-01",
    studenti: new Array("ettore", "carlo","luca", "camarcorlo")
}, {
    corso: "Geometry",
    lezione: "GY-01",
    studenti: new Array("ettore", "carlo")
    
}, {
    corso: "History",
    lezione: "HY-02",
    studenti: new Array("ettore", "camarcorlo")
}, {
    corso: "Software Engineering 2",
    lezione: "SE2-01",
    studenti: new Array("")
}, {
    corso: "Software Engineering 2",
    lezione: "SE2-02",
    studenti: new Array("Marco","Luca")
}, {
    corso: "Analisi",
    lezione: "AI-01",
    studenti: new Array("ludo", "carlo","max")
}]



class Teacher extends React.Component {
    constructor(props) {
      super(props);
  
      this.state = {
          totalLectures : listaLezioni,
          course : listaLezioni[0].corso,
          students : listaLezioni[0].studenti,
          lecture : listaLezioni[0].lezione,
      };
    }

    getStudentsBooked(){
        this.props.studentsBooked();//manda parametro con lectureId
        //setta stato studenti presenti alla lezione
    }

    deleteLecture(lecture){
        this.setState({totalLectures : this.state.totalLectures.filter(c => c.lezione !== lecture)})
        //collega all'API

    };
    
    render() {
        const corsi =this.state.totalLectures.map((item) => item.corso ).filter((v,i,s)=> s.indexOf(v) === i ) ;
        return (
            <AuthContext.Consumer>
            {(context) => (
              <>
                {context.authUser ? (
                  <>
            <Container fluid className="mt-5 "> 
            
                <Row className="justify-content-md-center" >
                    <h1>Welcome back Mario</h1> 
                    
                </Row>
                
                <Tabs defaultActiveKey={this.state.totalLectures[0].corso}  id="noanim-tab-example">
                    {corsi?.map((C_Id)=> (
                         <Tab eventKey={C_Id} title={C_Id} >
                             <Row className="mt-5 justify-content-md-center">
                             <Col md={4} >
                                <Tab.Container id="list-group-tabs-example" >
                                    <ListGroup className="mt-5" >
                                        {
                                            this.state.totalLectures.filter(l => l.corso===C_Id)?.map((c) => (
                                                        <ListGroup.Item action active={c.lezione===this.state.lecture} 
                                                            onClick={()=> this.setState({students: c.studenti, course: c.corso, lecture: c.lezione})}>
                                                            {c.lezione} 
                                                            
                                                            <button type="button" class="close" aria-label="Close" onClick={this.deleteLecture.bind(this, c.lezione)}>
                                                                <span aria-hidden="true">&times;</span>
                                                            </button>
                                                        </ListGroup.Item>
                                            ))}
                                    </ListGroup>
                                </Tab.Container>
                            </Col>
                            <Col md={1}></Col>
                            <Col md={4}>
                                <ListGroup as="ul">
                                    <ListGroup.Item as="li" active>
                                        <h3>students booked</h3>
                                    </ListGroup.Item>
                                    
                                        {this.state.students.map((s)=> (
                                            <ListGroup.Item as="li">{s} 
                                                
                                            </ListGroup.Item>
                                        )
                                        )}
                                    
                                </ListGroup>
                            </Col> 
                             </Row>
                         </Tab>
                    )
                    
                    )}
                </Tabs>
            </Container>
            </>
            ) : (
              <></>
            )}
          </>
        )}
      </AuthContext.Consumer>);
    }
}


function funct_Student(corso){
    this.setState({course : corso.corso , students : corso.studenti });
}

export default Teacher;