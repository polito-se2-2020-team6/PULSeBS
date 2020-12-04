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

var n = 0;
//////////////////////////////////// variabili prova max
var months = [ "January", "February", "March", "April", "May", "June", 
"July", "August", "September", "October", "November", "December" ];


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
      totalLectures: [],
      allCourses: []
    };
  }

  componentDidMount(){
    
    this.getLectures(this.context.authUser.userId)
    

  }


  getLectures = (userId) => {
    API.getAllLectures(userId)
      .then((lectures) => {
        var today = new Date();
        
       
        this.setState({
          totalLectures: lectures.filter(l => new Date(l.startTS)<today)  || [],
        });
        
        
        
        const seen = new Set();
        const filteredArr = this.state.totalLectures.filter(l => {
        const duplicate = seen.has(l.courseId);
        seen.add(l.courseId);
        return !duplicate;
        });
        console.log(filteredArr);
        this.setState({allCourses: filteredArr});
        this.setState({detailLevelCourse: this.state.allCourses[0].courseName});
      })
      .catch((errorObj) => {
        console.log(errorObj);
      });
  };

  getWeek = () => {
    var date = new Date();
    date.setHours(0, 0, 0, 0);
    // Thursday in current week decides the year.
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    // January 4 is always in week 1.
    var week1 = new Date(date.getFullYear(), 0, 4);
    // Adjust to Thursday in week 1 and count number of weeks from date to week1.
    return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000
                          - 3 + (week1.getDay() + 6) % 7) / 7);
  }

  getStats = (idLecture, idCourse, period, week, month, year, i, data, tableData) => {
    API.getStats(idLecture, idCourse, period, week, month, year)
      .then((s) => {
        console.log(s);
        //this.setState({
        //  totalLectures: lectures || [],
        //});
        console.log(month);
        console.log(week);
        console.log(idLecture);
        data.labels[i]=0;
        data.labels[i]= month || week || idLecture;
        console.log(data.labels[i]);
        data.datasets[0].data[i]=s.bookingsAvg;
        //console.log("stampe")
        //console.log(i);
        //console.log(this.state.detailLevel);
        //console.log(this.state.totalLectures.length);
        tableData[i] = {labels: months[month] || week || idLecture, data: s.bookingsAvg}
        if(this.state.detailLevel==="Week"|| this.state.detailLevel==="Month"){
          n++;
          console.log("primo")
          if(n>=10){
            n=0;
            console.log("patasta");
            this.setState({dataState : data, lectures : tableData});
          }
        }
        if(this.state.detailLevel==="Lecture"){
          n++;
          console.log("LEZIONI");
          console.log(n);
          if(n>=this.state.totalLectures.length){
            n=0;
            console.log("patasta");
            this.setState({dataState : data, lectures : tableData});
          }
        }

      })
      .catch((errorObj) => {
        console.log(errorObj);
      });
  };

  changeValue(text) {
    var i;
    var data = {
      labels: [],
      datasets: [
        {
          label: 'AVG Bookings',
          backgroundColor: 'rgb(22, 205, 254)',
          borderColor: 'rgb(35, 126, 254)',
          borderWidth: 1,
          hoverBackgroundColor: 'rgb(151, 205, 251)',
          hoverBorderColor: 'rgb(151, 205, 240)',
          data: []
         
        },
      ]
    };
    var tableData = [];
    var date = new Date();
    
    if (text === 'Lecture'){
      
      for(i=0;i<this.state.totalLectures.length;i++){
        
        this.getStats(this.state.totalLectures[i].lectureId, this.state.allCourses.find(x => x.courseName === this.state.detailLevelCourse).courseId, '','', '', '', i, data, tableData);
      }
    }else if (text === 'Week'){
      for(i=0;i<10;i++){
                this.getStats('', this.state.allCourses.find(x => x.courseName === this.state.detailLevelCourse).courseId, 'week', (this.getWeek()-10+i)%52, '', date.getFullYear(), i, data, tableData) 
            }
    }else if (text === 'Month'){
      var tableData = [];
      for(i=0;i<10;i++){
         this.getStats('', this.state.allCourses.find(x => x.courseName === this.state.detailLevelCourse).courseId, 'month', '', (date.getMonth()-10+i)%12, date.getFullYear(), i, data, tableData)
      }  
    }
    
    this.setState({detailLevel: text})
  }

  render() {
   
    return (
      <AuthContext.Consumer>
        {(context) => (
            <>
            {context.authUser ? (
          
        <>
        <Container className="mt-5">
            <Row>
              <Col md={2}>
            <Dropdown>
              <Dropdown.Toggle variant="success" id="dropdown-basic">
                {this.state.detailLevel}
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <Dropdown.Item  onClick={(e) => this.changeValue(e.target.textContent)}>Lecture</Dropdown.Item>
                <Dropdown.Item  onClick={(e) => this.changeValue(e.target.textContent)}>Week</Dropdown.Item>
                <Dropdown.Item  onClick={(e) => this.changeValue(e.target.textContent)}>Month</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            </Col>
            <Col md={2}>
              <Dropdown>
                        <Dropdown.Toggle variant="success" id="dropdown-basic">
                          {this.state.detailLevelCourse}
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                        {this.state.allCourses?.map((c) =>(
                          <Dropdown.Item key={c.courseId}  onClick={(e) => this.setState({detailLevelCourse: e.target.textContent})}>{c.courseName}</Dropdown.Item>
                        ))}
                        </Dropdown.Menu>
              </Dropdown>
           </Col>
            </Row>
            <Row>
              <Col><h2 className="text-center">Table Data</h2></Col>
            </Row>
            <Table striped bordered hover size="sm" className="mt-2">
              <thead>
                <tr>
                  
                  <th>{this.state.detailLevel}</th>
                  <th>Average bookings</th>
                </tr>
              </thead>
              <tbody>
                {this.state.lectures?.map((l) =>(
                  <tr>
                    
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
              <div className="flex flex-col items-center w-full max-w-md" >
                <form name="myForm">
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
     ) : (
      <><Redirect to='/login'  /></>
    )}
  </>
  )}
</AuthContext.Consumer>
);
}
} 

HistoricalData.contextType = AuthContext;
export default HistoricalData;
