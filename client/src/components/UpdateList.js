import React, { Component } from "react";
import { AuthContext } from "../auth/AuthContext";
import API from "../API/API";
import  { Redirect } from 'react-router-dom'
import DropdownButton from 'react-bootstrap/DropdownButton'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import {
    Col,
    Button,
    Row,
    Dropdown,
    
  } from "react-bootstrap";
class UpdateList extends Component {
  constructor(props) {
    super(props);
    this.state = {
        year: "None",
        semester: "None",
        years:[],
        semesters:["None",1,2],
        start_date:null,
        end_date:null,
        insertDate:false,
        online:true,
    };
  }

  componentDidMount(){
        var vect_year=[];
        vect_year[0]="None"
        for(var i=1;i<=5; i++){
                vect_year[i]=i;
        }
        //console.log(vect_year);
        this.setState({years: vect_year});
  }
  setYear(year){
        //console.log(year)
        this.setState({year: year});
  }
  setSemester(sem){
        //console.log(sem)
        this.setState({semester: sem});
    }
    UpdateFunction(){
        //console.log("Updateeee")
        //api call
        let y = this.state.year!=="None"? this.state.year: "";
        let s = this.state.semester!=="None"? this.state.semester: "";
        let start=null
        let end=null
        if(this.state.insertDate){
            start = this.state.start_date? this.state.start_date.toISOString() : null 
            end = this.state.end_date? this.state.end_date.toISOString() : null
        }
        
        API.UpdateLectureList(y,s,start,end,this.state.online)
        .then((res) => {
          console.log("andata bene")
          console.log(res)
        })
        .catch((errorObj) => {
          console.log("male")
          console.log(errorObj);
        });
        //maybe add some window to confirm update
    }
    selectedDate(date,who){
      console.log("selectedDate")
      if(who==="start"){
          this.setState({start_date: date})
          console.log(date)
      }
      else {
          this.setState({end_date: date})
          console.log(date)
      }

    }
    changeInsertDate(bool){
      this.setState({insertDate:bool})
      if(!bool){
          //caso in cui rimuovo la data
          this.setState({start_date:null,end_date:null})
      }
    }
    changeOnlineStatus(bool){
      this.setState({online:bool})
    }

  render() {
    return (
      <AuthContext.Consumer>
        {(context) => (
          <>
            {context.authUser ? (
               <>
                    <h1 className="m-4">Update List of bookable lectures</h1>
                    <Row>
                      <Col md={1}></Col>
                      <h5>Legend :</h5>
                      <Col md={3}> 
                      <Row>-if you select the year you will update all the lectures of the specific year, if "None" is selected means "all the years"</Row>
                      <Row>-if you select semester you will update all the lectures of the specific semester, if "None" is selected means "all the semesters"</Row>
                      <Row>-if start date is selected you will update all the lectures after the specific date, if there is not a start date it automatically select the current date</Row>
                      <Row>-if end date is selected you will update all the lectures before the specific date</Row>
                      <Row>-you can combine the four parameters in order to obtain what ever you want</Row>
                      
                      
                      
                       
                      
                      </Col>
                      </Row>
                   <br></br>
                    <Row>
                          <Col md={1}></Col>
                          <Col md={1}>
                            Status
                            {this.state.online?
                            <Button variant="outline-success" onClick={() => this.changeOnlineStatus(false)}>Online</Button>
                            :
                            <Button variant="outline-danger" onClick={() => this.changeOnlineStatus(true)}>Presence</Button>
                            
                          }
                            
                          </Col>
                          <Col md={1}>
                            Year
                      <DropdownButton
                        
                        key="secondary"
                        
                        variant="secondary"
                        title={this.state.year}
                        >   
                        {
                            this.state.years?.map( (y) =>(
                            <Dropdown.Item eventKey="1"  onClick={(e) =>
                                this.setYear(e.target.textContent)
                              }>{y}
                              </Dropdown.Item>
                            ))
                        }
                        </DropdownButton>
                        </Col>
                        <Col md={1}>
                          Semester
                        <DropdownButton
                        key="secondary"
                        variant="secondary"
                        title={this.state.semester}
                        >   
                        {
                            this.state.semesters?.map( (y) =>(
                            <Dropdown.Item eventKey="1"  onClick={(e) =>
                                this.setSemester(e.target.textContent)
                              }>{y}
                              </Dropdown.Item>
                            ))
                        }
                      
                        </DropdownButton>
                        </Col>
                        {this.state.insertDate?
                        <>
                        <Col md={2}>
                        <Row>Start date</Row>
                        <Row>
                        <DatePicker
                          selected={this.state.start_date}
                          onChange={date => this.selectedDate(date,"start")}
                        />
                        </Row>
                      </Col>
                      <Col md={2}>
                        <Row>End date</Row>
                        <Row>
                        <DatePicker
                          selected={this.state.end_date}
                          onChange={date => this.selectedDate(date,"end")}
                        />
                        </Row>
                      </Col>
                      <Button  onClick={(e) =>  this.changeInsertDate(false)} >Remove date</Button>
                      </>
                      :
                      <>
                      <Button  onClick={(e) =>  this.changeInsertDate(true)} >Insert date</Button>
                      </>
                        
                      }
                        


                    </Row>
                        <br></br>
                            {(this.state.year!=="None" || this.state.semester!=="None" || (this.state.insertDate && (this.state.start_date || this.state.end_date)))?
                            <Row>
                            <Col md={1}></Col>
                            <Col md={1}><Button variant="success"  size="lg"onClick= { () => this.UpdateFunction()}>Update</Button> </Col>
                            </Row>
                            
                            :
                            <></>
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

export default UpdateList;
