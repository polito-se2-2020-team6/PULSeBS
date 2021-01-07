import React, { Component } from "react";
import { AuthContext } from "../auth/AuthContext";
import  { Redirect } from 'react-router-dom'
import DropdownButton from 'react-bootstrap/DropdownButton'
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
        year: "Select Year",
        semester: "Select Semester",
        years:[],
        semesters:["First","Second"],
    };
  }

  componentDidMount(){
        var date = new Date();
        var vect_year=[];
        for(var i=0;i<4; i++){
                vect_year[i]=date.getFullYear()+i;
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
        //maybe add some window to confirm update
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
                  <Col md={1}>
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
                </Row>
                <br></br>
                    {(this.state.year!=="Select Year" && this.state.semester!=="Select Semester")?
                    <Row>
                    <Col md={1}></Col>
                    <Col md={1}><Button onClick= { () => this.UpdateFunction()}>Update</Button> </Col>
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
