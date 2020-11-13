import React from "react";
import { Col, Container, Row, Tabs, Tab, ListGroup } from "react-bootstrap";


var listaCorsi = [{
    corso: "13:30",
    studenti: new Array("ettore", "carlo","luca", "camarcorlo")
}, {
    corso: "14:30",
    studenti: new Array("ettore", "carlo")
    
}, {
    corso: "15:30",
    studenti: new Array("")
}, {
    corso: "16:30",
    studenti: new Array("ludo", "carlo","max")
}]



class Teacher extends React.Component {
    constructor(props) {
      super(props);
  
      this.state = {
          totalCourses : listaCorsi,
          course : listaCorsi[0].corso,
          students : listaCorsi[0].studenti
      };
    }

    getStudentsBooked(){
        this.props.studentsBooked();//manda parametro con lectureId
        //setta stato studenti presenti alla lezione
    }

    deleteLecture(lecture){
        this.setState({totalCourses : this.state.totalCourses.filter(c => c.corso !== lecture)})
        //collega all'API

    };

    render() {
        return (<>
            <Container fluid className="mt-5 "> 
            
                <Row className="justify-content-md-center" >
                    <h1>Welcome back Mario</h1> 
                    
                </Row>
                
                <Tabs defaultActiveKey="history"  id="noanim-tab-example">
                <Tab eventKey="history" title="History">
                <Row className="mt-5 justify-content-md-center">
                    <Col md={4}>
                        
                    <Tab.Container id="list-group-tabs-example" >
                        <ListGroup className="mt-5">
                            {this.state.totalCourses?.map((c) => (
                                    
                                        <ListGroup.Item action active={c.corso===this.state.course} onClick={()=> this.setState({students: c.studenti, course: c.corso})}>{c.corso} 
                                           
                                            <button type="button" class="close" aria-label="Close" onClick={this.deleteLecture.bind(this, c.corso)}>
                                                <span aria-hidden="true">&times;</span>
                                            </button>
                                        </ListGroup.Item>
                                    
                                ))}
                        </ListGroup>
                    </Tab.Container>

                    </Col>
                    <Col md={1}></Col>
                    {/*<Col md={4}>
                        <ListGroup as="ul">
                            <ListGroup.Item as="li" active>
                                <h1>Lectures</h1>
                            </ListGroup.Item>
                                {this.state.totalCourses?.map((c) => (
                                    
                                        <ListGroup.Item as="li" action  onClick={()=> this.setState({students: c.studenti, course: c.corso})}>{c.corso} 
                                            <button type="button" class="close" aria-label="Close" onClick={this.deleteLecture.bind(this, c.corso)}>
                                                <span aria-hidden="true">&times;</span>
                                            </button>
                                        </ListGroup.Item>
                                    
                                ))}
                        </ListGroup>
                    </Col> */}

                    <Col md={4}>
                        <ListGroup as="ul">
                            <ListGroup.Item as="li" active>
                                <h1>students booked</h1>
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
                <Tab eventKey="Software Engineering 2" title="Software Engineering 2">
                <Row className="mt-5 justify-content-md-center">
                    <Col md={4}>
                        
                    <Tab.Container id="list-group-tabs-example" >
                        <ListGroup className="mt-5">
                            {this.state.totalCourses?.map((c) => (
                                    
                                        <ListGroup.Item action active={c.corso===this.state.course} onClick={()=> this.setState({students: c.studenti, course: c.corso})}>{c.corso} 
                                            <button type="button" class="close" aria-label="Close" onClick={this.deleteLecture.bind(this, c.corso)}>
                                                <span aria-hidden="true">&times;</span>
                                            </button>
                                        </ListGroup.Item>
                                    
                                ))}
                        </ListGroup>
                    </Tab.Container>

                    </Col>
                    <Col md={1}></Col>
                    {/*<Col md={4}>
                        <ListGroup as="ul">
                            <ListGroup.Item as="li" active>
                                <h1>Lectures</h1>
                            </ListGroup.Item>
                                {this.state.totalCourses?.map((c) => (
                                    
                                        <ListGroup.Item as="li" action  onClick={()=> this.setState({students: c.studenti, course: c.corso})}>{c.corso} 
                                            <button type="button" class="close" aria-label="Close" onClick={this.deleteLecture.bind(this, c.corso)}>
                                                <span aria-hidden="true">&times;</span>
                                            </button>
                                        </ListGroup.Item>
                                    
                                ))}
                        </ListGroup>
                    </Col> */}

                    <Col md={4}>
                        <ListGroup as="ul">
                            <ListGroup.Item as="li" active>
                                <h1>students booked</h1>
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
                </Tabs>
                
            </Container>
        </>);
    }
}


function funct_Student(corso){
    this.setState({course : corso.corso , students : corso.studenti });
}

export default Teacher;