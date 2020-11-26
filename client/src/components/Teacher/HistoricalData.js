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

class HistoricalData extends React.Component {
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



  render() {
   

    return (
        <>
        <Container>
            <Row ><Col><h2 className="text-center">Table Data</h2></Col></Row>
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
