import React, { Component } from "react";
import { AuthContext } from "../auth/AuthContext";
import API from "../API/API";
import { Redirect } from "react-router-dom";
import DropdownButton from "react-bootstrap/DropdownButton";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import DialogAlert from "./DialogAlert";
// import HelpOutlineIcon from "@material-ui/icons/HelpOutline";
// import InfoIcon from "@material-ui/icons/Info";
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ContactSupportIcon from "@material-ui/icons/ContactSupport";
import Tooltip from "@material-ui/core/Tooltip";
import { Col, Row, Dropdown, OverlayTrigger } from "react-bootstrap";
import { Typography, Button, Container } from "@material-ui/core";
import { Alert } from "@material-ui/lab";

class UpdateList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      year: "None",
      semester: "None",
      years: [],
      semesters: ["None", 1, 2],
      start_date: null,
      end_date: null,
      insertDate: false,
      online: true,
      response: "",
      today: null,
      showend:false,
      showstart:false,
    };
  }

  componentDidMount() {
    var vect_year = [];
    vect_year[0] = "None";
    for (var i = 1; i <= 5; i++) {
      vect_year[i] = i;
    }
    this.setState({ years: vect_year });
  }
  setYear(year) {
    this.setState({ year: year, response: "" });
  }
  setSemester(sem) {
    this.setState({ semester: sem, response: "" });
  }
  UpdateFunction() {
    let y = this.state.year !== "None" ? this.state.year : "";
    let s = this.state.semester !== "None" ? this.state.semester : "";
    let start = null;
    let end = null;
    if (this.state.insertDate) {
      start = this.state.start_date
        ? this.state.start_date.toISOString()
        : null;
      end = this.state.end_date ? this.state.end_date.toISOString() : null;
    }
    API.UpdateLectureList(y, s, start, end, !this.state.online)
      .then((res) => {
        this.setState({ response: "Succesfully Update!" });
      })
      .catch((errorObj) => {
        // console.log(errorObj);
        this.setState({ response: "Problem with the Update" });
      });
  }
  selectedDate(date, who) {
    if (who === "start") {
      this.setState({ start_date: date, response: "" });
    } else {
      this.setState({ end_date: date, response: "" });
    }
  }
  changeInsertDate(bool) {
    this.setState({ insertDate: bool, response: "" });
    if (!bool) {
      //caso in cui rimuovo la data
      this.setState({ start_date: null, end_date: null });
    }
  }
  showDate(value){
    if(value==="end"){
      this.setState({showend: !this.state.showend, end_date: null})
    }
    else{
      this.setState({showstart: !this.state.showstart, start_date: null})
    }
  }
  changeOnlineStatus = () => {
    this.setState({ online: !this.state.online, response: "" });
  };
  render() {
    return (
      <AuthContext.Consumer>
        {(context) => (
          <>
            {context.authUser ? (
              <>
                <h1 className="m-4">Update List of bookable lectures</h1>
                {/* <Row>
                  <Col md={4}></Col>
                </Row> */}
                <Container>
                  <Row id="row1">
                    <Col>
                      <Row>
                        <Col md={1}></Col>
                        <Col md={3}>
                          {/* Show the current sattus */}
                          {/* <Row>
                      <Col>
                        <Typography
                          style={{ fontWeight: "bold" }}
                          size="sm"
                          variant="outline-dark"
                          id="ButU1"
                        >
                          Current Status: {"\u00A0"}
                          {this.state.online ? "Online" : "Presence"}
                        </Typography>
                      </Col>
                    </Row> */}

                          {/* <Col className="mt-3"> */}
                          <Typography id="ButU1">
                            Update the state of lectures to{" "}
                          </Typography>
                          {/* </Col> */}

                          {/* {this.state.online ? (
                      <Button
                        // variant="outline-success"
                        color="primary"
                        id="ButU2"
                        onClick={() => this.changeOnlineStatus(false)}
                      >
                        Online
                      </Button>
                    ) : (
                      <Button
                        // variant="outline-danger"
                        color="secondary"
                        id="ButU3"
                        onClick={() => this.changeOnlineStatus(true)}
                      >
                        Presence
                      </Button>
                    )} */}
                          {/* {this.state.online ? ( */}
                          <Button
                            variant="outlined"
                            fullWidth
                            // variant="outline-success"
                            color={!this.state.online ? "primary" : "secondary"}
                            id="ButU2"
                            onClick={this.changeOnlineStatus}
                          >
                            {!this.state.online ? "Online" : "Presence"}
                          </Button>
                          {/* ) : (
                      <Button
                        // variant="outline-danger"
                        color="secondary"
                        id="ButU3"
                        onClick={() => this.changeOnlineStatus(true)}
                      >
                        Presence
                      </Button>
                    )} */}
                        </Col>
                        {/* <Col md={}></Col> */}
                      </Row>
                      <Row className="mt-4">
                        <Col md={1}></Col>
                        <Col md={2}>
                          {/* <OverlayTrigger
                      id="Over1"
                      key="top"
                      placement="top"
                      overlay={
                        <Tooltip id={`tooltip-top`}>
                          if you select the Year you will update all the
                          lectures of the specific Academic Year, "None" means
                          "all the years"
                        </Tooltip>
                      }
                    >
                      <Button
                        size="md"
                        variant="outline-dark"
                        className="cell"
                        id="ButU4"
                        style={{ cursor: "help" }}
                      >
                        Academic Year
                      </Button>
                    </OverlayTrigger> */}
                          <Tooltip
                            title={
                              <h5 style={{}}>
                                if you select the Year you will update all the
                                lectures of the specific Academic Year, "None"
                                means "all the years"
                              </h5>
                            }
                          >
                            <ContactSupportIcon />
                          </Tooltip>
                          <Typography>Academic Year</Typography>
                          <DropdownButton
                            key="secondary"
                            id="DropD1"
                            variant="secondary"
                            title={this.state.year}
                          >
                            {this.state.years?.map((y) => (
                              <Dropdown.Item
                                eventKey="1"
                                onClick={(e) =>
                                  this.setYear(e.target.textContent)
                                }
                              >
                                {y}
                              </Dropdown.Item>
                            ))}
                          </DropdownButton>
                        </Col>
                        <Col md={2}>
                          {/* <OverlayTrigger
                      key="top"
                      id="Over2"
                      placement="top"
                      overlay={
                        <Tooltip id={`tooltip-top`}>
                          <HelpOutlineIcon>
                            if you select semester you will update all the
                            lectures of the specific semester, None means all
                            the semesters"
                          </HelpOutlineIcon>
                        </Tooltip>
                      }
                    > */}
                          <Tooltip
                            title={
                              <h5 style={{}}>
                                if you select semester you will update all the
                                lectures of the specific semester, None means
                                all the semesters
                              </h5>
                            }
                          >
                            <ContactSupportIcon />
                          </Tooltip>
                          {/* <Button
                      size="md"
                      variant="outline-dark"
                      id="ButU5"
                      style={{ cursor: "help" }}
                    >
                      Semester
                    </Button> */}
                          {/* </OverlayTrigger> */}
                          <Typography>Semester</Typography>
                          <DropdownButton
                            key="secondary"
                            id="Dropdw2"
                            variant="secondary"
                            title={this.state.semester}
                          >
                            {this.state.semesters?.map((y) => (
                              <Dropdown.Item
                                id={y.key}
                                eventKey="1"
                                onClick={(e) =>
                                  this.setSemester(e.target.textContent)
                                }
                              >
                                {y}
                              </Dropdown.Item>
                            ))}
                          </DropdownButton>
                        </Col>
                      </Row>
                      <Row
                        style={{ padding: "none", textAlign: "center" }}
                        className="mt-5"
                      >
                        {this.state.insertDate ? (
                          <Col md={12}>
                            <Row>
                              <Col md={3}></Col>
                              <Col md={3}>
                                {/* <OverlayTrigger
                            key="top"
                            id="OverL3"
                            placement="top"
                            overlay={
                              <Tooltip id={`tooltip-top`}>
                                <HelpOutlineIcon>
                                  if start date is selected you will update all
                                  the lectures after the specific date, if there
                                  is not a Start date it automatically selects
                                  the current date
                                </HelpOutlineIcon>
                              </Tooltip>
                            }
                          >
                            <Button
                              size="md"
                              variant="outline-dark"
                              id="ButU6"
                              style={{ cursor: "help" }}
                            >
                              Start date
                            </Button>
                          </OverlayTrigger> */}
                                <Tooltip
                                  title={
                                    <h5 style={{}}>
                                      if start date is selected you will update
                                      all the lectures after the specific date,
                                      if there is not a Start date it
                                      automatically selects the current date
                                    </h5>
                                  }
                                >
                                  <ContactSupportIcon />
                                </Tooltip>
                                <Typography>Start Date</Typography>
                                <ArrowDropDownIcon style={{cursor:"pointer"}} onClick={ ()=> this.showDate("start")}/>
                                {this.state.showstart?<DatePicker
                                  style={{ padding: "none" }}
                                  inline
                                  id="start"
                                  selected={this.state.start_date}
                                  minDate={new Date()}
                                  onChange={(date) =>
                                    this.selectedDate(date, "start")
                                  }
                                />
                              :<></> }
                                
                              </Col>

                              <Col md={3}>
                                {/* <OverlayTrigger
                            key="top"
                            id="OverL4"
                            placement="top"
                            overlay={
                              <Tooltip id={`tooltip-top`}>
                                if End date is selected you will update all the
                                lectures before the specific date
                              </Tooltip>
                            }
                          >
                            <Button
                              size="sm"
                              variant="outline-dark"
                              id="ButU7"
                              style={{ cursor: "help" }}
                            >
                              End date
                            </Button>
                          </OverlayTrigger> */}

                                <Tooltip
                                  title={
                                    <h5 style={{}}>
                                      if End date is selected you will update
                                      all the lectures before the specific date
                                    </h5>
                                  }
                                >
                                  <ContactSupportIcon />
                                </Tooltip>
                                <Typography>End Date</Typography>
                                <ArrowDropDownIcon style={{cursor:"pointer"}} onClick={ ()=> this.showDate("end")}/>
                                {this.state.showend?<DatePicker
                                  style={{ padding: "none" }}
                                  inline
                                  id="end"
                                  defaultDate={""}
                                  selected={this.state.end_date}
                                  minDate={new Date()}
                                  onChange={(date) =>
                                    this.selectedDate(date, "end")
                                  }
                                />
                                : <></>}
                                
                              </Col>
                              <Col md={3}></Col>
                            </Row>
                            <Row>
                              <Col md={12}>
                                <Row style={{ marginTop: "30px" }}>
                                  <Col md={4}></Col>
                                  <Col md={4}>
                                    <Button
                                      variant="outlined"
                                      color="secondary"
                                      fullWidth
                                      id="ButU8"
                                      onClick={(e) =>
                                        this.changeInsertDate(false)
                                      }
                                    >
                                      Disable Calendar
                                    </Button>
                                  </Col>
                                  <Col md={4}></Col>
                                </Row>
                              </Col>
                            </Row>
                          </Col>
                        ) : (
                          <>
                            <Col md={4}></Col>
                            <Col md={4}>
                              <Button
                                variant="outlined"
                                color="primary"
                                fullWidth
                                id="ButU9"
                                onClick={(e) => this.changeInsertDate(true)}
                              >
                                Enable Calendar
                              </Button>
                            </Col>
                          </>
                        )}
                      </Row>
                      <Row>
                        <Col md={1}></Col>
                        <Col md={3}>
                          <DialogAlert
                            id="UpL2"
                            dialog={"UpdateList"}
                            onConfirm={() => {
                              this.UpdateFunction();
                            }}
                          />
                        </Col>
                        {this.state.response && (
                          <Col md={3} style={{ marginTop: "25px" }}>
                            <Alert>Successfully Update!</Alert>
                          </Col>
                        )}
                      </Row>
                    </Col>
                  </Row>
                </Container>
              </>
            ) : (
              <>
                <Redirect to="/login" />
              </>
            )}
          </>
        )}
      </AuthContext.Consumer>
    );
  }
}
export default UpdateList;
