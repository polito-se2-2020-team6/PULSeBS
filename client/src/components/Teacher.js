import React from "react";
import { Col, Container, Row, Button, ListGroup } from "react-bootstrap";


var listaCorsi = [{
    corso: "History",
    studenti: new Array("ettore", "carlo","luca", "camarcorlo")
}, {
    corso: "Geometry",
    studenti: new Array("ettore", "carlo")
    
}, {
    corso: "Software Engineering 2",
    studenti: new Array("")
}, {
    corso: "Analisi",
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

    deleteLecture(lecture){
        this.setState({totalCourses : this.state.totalCourses.filter(c => c.corso !== lecture)})
        

    };

    render() {
        return (<>
            <Container fluid className="mt-5 "> 
                <Row className="justify-content-md-center" >
                    <h1>Welcome back Mario</h1> 
                    
                </Row>
                <Row className="mt-5 ">
                    <Col md={1}></Col>
                    <Col md={4}>
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
                    </Col>

                    <Col md={6}>
                        <ListGroup as="ul">
                            <ListGroup.Item as="li" active>
                                <h1>{this.state.course}'s students</h1>
                            </ListGroup.Item>
                            
                                {this.state.students.map((s)=> (
                                    <ListGroup.Item as="li">{s} 
                                        
                                    </ListGroup.Item>
                                )
                                )}
                              
                        </ListGroup>
                    </Col>
                    
                    
                    
                </Row>
            </Container>
        </>);
    }
}


function funct_Student(corso){
    this.setState({course : corso.corso , students : corso.studenti });
}

export default Teacher;