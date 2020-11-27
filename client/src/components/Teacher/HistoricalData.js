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
  Table,
  Dropdown
} from "react-bootstrap";
import { AuthContext } from "../../auth/AuthContext";


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
var lecturesDetailDay = [
  {
    course: "History",
    lecture: "HY-01",
    averge: 5,
  },
  {
    course: "Hello",
    lecture: "HY-02",
    averge: 7,
  }];

  var lecturesDetailMonth = [
    {
      course: "History",
      lecture: "HY-01",
      averge: 1,
    },
    {
      course: "Hello",
      lecture: "HY-02",
      averge: 3,
    }];

class HistoricalData extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      lectures: lecturesDetailDay,
      detailLevel: 'Select detail'
    };
  }

  changeValue(text) {
    //here changes the detail,need an API call to retrieve the data

    //just to try
    if (text === 'Day'){
      this.setState({lectures: lecturesDetailDay});
    }else if (text === 'Month'){
      this.setState({lectures: lecturesDetailMonth});
    }
    
    this.setState({detailLevel: text})
  }



  render() {
   

    return (
        <>
        <Container className="mt-5">
            <Row>
            <Dropdown>
              <Dropdown.Toggle variant="success" id="dropdown-basic">
                {this.state.detailLevel}
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <Dropdown.Item  onClick={(e) => this.changeValue(e.target.textContent)}>Day</Dropdown.Item>
                <Dropdown.Item  onClick={(e) => this.changeValue(e.target.textContent)}>Week</Dropdown.Item>
                <Dropdown.Item  onClick={(e) => this.changeValue(e.target.textContent)}>Month</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            </Row>
            <Row>
              <Col><h2 className="text-center">Table Data</h2></Col>
            </Row>
            <Table striped bordered hover size="sm" className="mt-2">
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Lecture</th>
                  <th>Average bookings</th>
                </tr>
              </thead>
              <tbody>
                {this.state.lectures?.map((l) => (
                <tr>
                  <td>{l.course}</td>
                  <td>{l.lecture}</td>
                  <td>{l.averge}</td>
                </tr>
                ))}
              </tbody>
            </Table>
            <br></br>
            <br></br>
            <br></br>
            <Row ><Col><h2 className="text-center">Graph Data</h2></Col></Row>
        </Container>
        </>
     );
  }
}


export default HistoricalData;
