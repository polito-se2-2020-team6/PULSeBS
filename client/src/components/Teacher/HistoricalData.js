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
  Table,
  Dropdown,
  Pagination,
  Spinner,
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
      allCourses: [],
      offset: 1,
      range: 5,
      progress: 0,
      maxOffset: 0,
    };
    this.wrapper = React.createRef();
  }

  componentDidMount(){
    console.log("Modulo")
    console.log(Math.floor((-10)/12))
    this.getLectures(this.context.authUser.userId)
    
  }
  /*
  getDateOfWeek(w, y) {
    var d = (1 + (w - 1) * 7); // 1st of January + 7 days for each week

    return new Date(y, 0, d);
}
*/

  getLectures = (userId) => {
    API.getAllLectures(userId)
      .then((lectures) => {
        var today = new Date();
        
       
        this.setState({
          totalLectures: lectures.filter(l => new Date(l.startTS)<today)  || [],
        });
        console.log(this.state.totalLectures);

        this.setState({maxOffset :   Math.ceil(this.state.totalLectures.length/10)})
        
        const seen = new Set();
        const filteredArr = this.state.totalLectures.filter(l => {
        const duplicate = seen.has(l.courseId);
        seen.add(l.courseId);
        return !duplicate;
        });
        console.log("filter")
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
        data.labels[i]= months[month] || week || idLecture;
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
            this.setState({progress : 0});
            
          }
        }
        if(this.state.detailLevel==="Lecture"){
          n++;
          console.log("LEZIONI");
          console.log(n);
          if(n>=this.state.totalLectures.length-10*(this.state.offset-1)){
            n=0;
            console.log("patasta");
            this.setState({dataState : data, lectures : tableData});
            this.setState({progress : 0});
          }
        }

      })
      .catch((errorObj) => {
        console.log(errorObj);
      });
  };

  changeValue(text) {
    this.setState({progress : 1});
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
      
      for(i=0;i<10;i++){
        let j = this.state.totalLectures.length-(10*this.state.offset)+i;
        if(j>=0){
        this.getStats(this.state.totalLectures[j].lectureId, this.state.allCourses.find(x => x.courseName === this.state.detailLevelCourse).courseId, '','', '', '', i, data, tableData);
        }

      }
    }else if (text === 'Week'){
      for(i=0;i<10;i++){
        console.log("dentro")
        let week= ((this.getWeek()-10*this.state.offset+i)%52+52)%52; 
        console.log(this.state.offset);
        let year=date.getFullYear() - Math.abs(Math.floor( (this.getWeek()-10*this.state.offset+i)/52) );
                this.getStats('', this.state.allCourses.find(x => x.courseName === this.state.detailLevelCourse).courseId, 'week', week, '', year, i, data, tableData) 
            }
    }else if (text === 'Month'){
      var tableData = [];
      for(i=0;i<10;i++){
        //testare modulo -30
        let month= ((date.getMonth()-10*this.state.offset+i)%12+12)%12; 
        let year=date.getFullYear() - Math.abs(Math.floor( (date.getMonth()-10*this.state.offset+i)/12) );
         this.getStats('', this.state.allCourses.find(x => x.courseName === this.state.detailLevelCourse).courseId, 'month', '',month , year, i, data, tableData)
      }  
    }
    
    this.setState({detailLevel: text})
  }

  async changeRange(x){
    console.log(x);
 
    if(x>0){
       await this.setState({offset: this.state.offset-1})
    }
    else if(x<0){
      await this.setState({offset: this.state.offset+1})

   }
   this.changeValue(this.state.detailLevel);
   //console.log(range);
    //this.setState({range: range});
  }

  async setOffset(detail){
    await this.setState({offset : 1});
    this.changeValue(detail);
  }

  render() {
   
    return (
      <AuthContext.Consumer>
        {(context) => (
            <>
            {context.authUser ? (
          
        <>
        {this.state.progress == 1 ?  <Row className="justify-content-md-center mt-5" ><Spinner animation="border" variant="primary" /></Row>: 
        <Container className="mt-5">
            <Row className="justify-content-md-center">
            {this.state.detailLevel==="Select detail"? <></> :
               <Pagination>
                      
                      {this.state.offset>=this.state.maxOffset && this.state.detailLevel==="Lecture" ? <></>: <Pagination.Prev  onClick={() => this.changeRange(-1)}/>}
                      <Pagination.Item disabled>{this.state.offset}</Pagination.Item>
                      
                      {this.state.offset<=1 ? <></>: <Pagination.Next onClick={() => this.changeRange(+1)}/>}

                </Pagination>
              } 
              <Col md={2}>
            <Dropdown>
              <Dropdown.Toggle variant="success" id="dropdown-basic">
                {this.state.detailLevel}
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <Dropdown.Item  onClick={(e) => this.setOffset(e.target.textContent)}>Lecture</Dropdown.Item>
                <Dropdown.Item  onClick={(e) => this.setOffset(e.target.textContent)}>Week</Dropdown.Item>
                <Dropdown.Item  onClick={(e) => this.setOffset(e.target.textContent)}>Month</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            </Col>
            <Col md={2}>
              {this.state.detailLevel==="Lecture"? <></> : 
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
              }
           </Col>
            </Row>
            <Row className="mt-3">
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
  }
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