import React from "react";
import { Col, Container, Row, Button, ListGroup } from "react-bootstrap";


var listaCorsi = [{
    corso: "storia",
    studenti: new Array("ettore", "carlo")
}, {
    corso: "geometria",
    studenti: new Array("ettore", "carlo")
    
}, {
    corso: "storia",
    studenti: new Array("ettore", "carlo")
}, {
    corso: "storia",
    studenti: new Array("ettore", "carlo")
}]

class Teacher extends React.Component {
    constructor(props) {
      super(props);
  
      this.state = {
      };
    }

    

    render() {
        return (<>
            <Container fluid className="mt-3 rounded-circle"> 
                <Row>
                    <Col >
                        <ListGroup as="ul">
                        <ListGroup.Item as="li" active>
                        Studenti
                        </ListGroup.Item>
                        <ListGroup.Item as="li">Carlo</ListGroup.Item>
                        <ListGroup.Item as="li">
                        Gianni
                        </ListGroup.Item>
                        <ListGroup.Item as="li">Ettore</ListGroup.Item>
                        </ListGroup>
                    </Col>
                    <Col>
                        <ListGroup as="ul">
                        <ListGroup.Item as="li" active>
                        Lezioni
                        </ListGroup.Item>
                        {listaCorsi?.map((c) => (
                          <ListGroup.Item as="li">{c.corso} <button type="button" class="close" aria-label="Close">
                                                            <span aria-hidden="true">&times;</span>
                                                        </button>
                          </ListGroup.Item>
                        ))}
                        </ListGroup>
                    </Col>
                    <Col></Col>
                    <Col></Col>
                </Row>
            </Container>
        </>);
    }
}

export default Teacher;