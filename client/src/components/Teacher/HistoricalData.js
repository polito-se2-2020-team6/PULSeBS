// filtro fatto su courseName invece che coureId, se cancelli tutte le lezioni 
// scompare la tab

import React, { Component } from "react";
import { Bar } from 'react-chartjs-2';
import API from "../../API/API";

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


var lecturesDetailDay = [
  {
    course: "History",
    lecture: "HY-01",
    averge: 4.9,
  },
  {
    course: "Hello",
    lecture: "HY-02",
    averge: 7.123456,
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


//////////////////////////////////// variabili prova max
  var last6Month = [
    {
      month: "Maggio",
      avg: 50,
    },
    {
      month: "Giugno",
      avg: 60,
    },
    {
      month: "Luglio",
      avg: 20.6,
    },
    {
      month: "Agosto",
      avg: 0,
    },
    {
      month: "Settembre",
      avg: 117.5,
    },
    {
      month: "Ottobre",
      avg: 100.8,
    },
    
  ];
  var lastYear = [
    {
      month: "Novembre",
      avg: 30,
    },
    {
      month: "Dicembre",
      avg: 24.5,
    },
    {
      month: "Gennaio",
      avg: 20.5,
    },
    {
      month: "Febbraio",
      avg: 10.4,
    },
    {
      month: "Marzo",
      avg: 50,
    },
    {
      month: "Aprile",
      avg: 120.2,
    },
    {
      month: "Maggio",
      avg: 50,
    },
    {
      month: "Giugno",
      avg: 60,
    },
    {
      month: "Luglio",
      avg: 20.6,
    },
    {
      month: "Agosto",
      avg: 0,
    },
    {
      month: "Settembre",
      avg: 117.5,
    },
    {
      month: "Ottobre",
      avg: 100.8,
    },
    
  ];
  var data = {
      labels: [],
      datasets: [
        {
          label: 'AVG Bookings/TOT Bookings',
          backgroundColor: 'rgb(22, 205, 254)',
          borderColor: 'rgb(35, 126, 254)',
          borderWidth: 1,
          hoverBackgroundColor: 'rgb(151, 205, 251)',
          hoverBorderColor: 'rgb(151, 205, 240)',
          data: []
         // data: []
        },
        // se vuoi puoi aggiungere un'altro datasets
      ]
    };
    var dataDefault = {
      labels: [],
      //labels: [],
       datasets: [
         {
           label: 'AVG Bookings/TOT Bookings',
           backgroundColor: 'rgb(22, 205, 254)',
           borderColor: 'rgb(35, 126, 254)',
           borderWidth: 1,
           hoverBackgroundColor: 'rgb(151, 205, 251)',
           hoverBorderColor: 'rgb(151, 205, 240)',
           data: []
          // data: []
         },
         // se vuoi puoi aggiungere un'altro datasets
       ]
     };


//////////////////////////////////// fine variabili max

class HistoricalData extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      lectures: [],
      detailLevel: 'Select detail',
      detailLevelCourse: 'Select Course',
      detailLevelPeriod: 'Select Period',
      prova: 'defaaalt',
      dataState : {},

    };
  }

  getStats = (idLecture, idCourse, period, week, month, year) => {
    API.getStats(idLecture, idCourse, period, week, month, year)
      .then((s) => {
        console.log(s);
        //this.setState({
        //  totalLectures: lectures || [],
        //});
      })
      .catch((errorObj) => {
        console.log(errorObj);
      });
  };

  changeValue(text) {
    //here changes the detail,need an API call to retrieve the data

    var tableData = [];
    var data = new Date();
    //just to try
    if (text === 'Lecture'){
      
    }else if (text === 'Week'){
      for(var i=0;i<6;i++){
              //ciclo di chiamate api, memorizzo in data gli ultimi 6 mesi in base al corso scelto
                data.labels[i]=last6Month[i].month;
                data.datasets[0].data[i]=last6Month[i].avg;
                //
                

                tableData[i] = {labels: last6Month[i].month, data: last6Month[i].avg}
                
            }

            this.setState({dataState : data, lectures : tableData});
            

    }else if (text === 'Month'){
      var tableData = [];
      for(var i=0;i<12;i++){
        //ciclo di chiamate api, memorizzo in data gli ultimi 12 mesi in base al corso scelto
          dataDefault.labels[i]=lastYear[i].month;
          dataDefault.datasets[0].data[i]=lastYear[i].avg;

         // this.getStats(null, this.state.detailLevelCourse, 'month', null, data.getMonth(), null)

          tableData[i] = {labels: lastYear[i].month, data: lastYear[i].avg}

      }
      this.setState({dataState : dataDefault, lectures: tableData});
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
                  <th>Period</th>
                  <th>Average bookings</th>
                </tr>
              </thead>
              <tbody>
                {this.state.lectures?.map((l) =>(
                  <tr>
                    <td>{this.state.detailLevelCourse}</td>
                    <td>{l.labels}</td>
                    <td>{l.data}</td>
                  </tr>
                )
                )}
              </tbody>
            </Table>
            <br></br>
            <br></br>
            <br></br>
            <Row >
              <Col><h2 className="text-center">Graph Data</h2>
                  <Row>
                    <Col>
                      <Dropdown>
                        <Dropdown.Toggle variant="success" id="dropdown-basic">
                          {this.state.detailLevelCourse}
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                          <Dropdown.Item  onClick={(e) => this.setState({detailLevelCourse: e.target.textContent})}>APA</Dropdown.Item>
                          <Dropdown.Item  onClick={(e) => this.setState({detailLevelCourse: e.target.textContent})}>Software Eng 2</Dropdown.Item>
                          <Dropdown.Item  onClick={(e) => this.setState({detailLevelCourse: e.target.textContent})}>WEB Application</Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </Col>
                    
                    
                </Row>
                
            
              <div className="flex flex-col items-center w-full max-w-md" >
                <form name="myForm">
                <h2>Statistics {this.state.prova}</h2>
                  <Bar
                      data={this.state.dataState}
                      width={100}
                      height={50}
                      options={{}}
                  />
                  </form>
               </div>
              
              </Col>
            </Row>
        </Container>
        </>
     );
  }
}


export default HistoricalData;
