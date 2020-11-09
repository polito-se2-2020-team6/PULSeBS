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
          course : listaCorsi[0].corso,
          students : listaCorsi[0].studenti
      };
    }

    

    render() {
        return (<>
            <Container fluid className="mt-3 "> 
                <Row>
                    <Col>
                        <ListGroup as="ul">
                            <ListGroup.Item as="li" active>
                                Lectures
                            </ListGroup.Item>
                                {listaCorsi?.map((c) => (
                                    <button className="square" onClick={()=> this.setState({students: c.studenti, course: c.corso})}>
                                        <ListGroup.Item as="li">{c.corso} 
                                            <button type="button" class="close" aria-label="Close">
                                                <span aria-hidden="true">&times;</span>
                                            </button>
                                        </ListGroup.Item>
                                    </button>
                                ))}
                        </ListGroup>
                    </Col>

                    <Col >
                        <ListGroup as="ul">
                            <ListGroup.Item as="li" active>
                                {this.state.course}'s students
                            </ListGroup.Item>
                            
                                {this.state.students.map((s)=> (
                                    <ListGroup.Item as="li">{s} 
                                        
                                    </ListGroup.Item>
                                )
                                )}
                              
                        </ListGroup>
                    </Col>
                    
                    <Col>

                    </Col>
                    <Col></Col>
                </Row>
            </Container>
        </>);
    }
}


function funct_Student(corso){
    this.setState({course : corso.corso , students : corso.studenti });
}

export default Teacher;