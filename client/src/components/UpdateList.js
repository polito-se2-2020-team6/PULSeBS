import React, { Component } from "react";
import { AuthContext } from "../auth/AuthContext";
import API from "../API/API";
import { Redirect } from "react-router-dom";
import DropdownButton from "react-bootstrap/DropdownButton";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import DialogAlert from "./DialogAlert";
import {
  Col,
  Button,
  Row,
  Dropdown,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
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
    API.UpdateLectureList(y, s, start, end, this.state.online)
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
  changeOnlineStatus(bool) {
    this.setState({ online: bool, response: "" });
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
                  <Col md={4}></Col>
                </Row>
                <br></br>
                <Row id="row1">
                  <Col md={1}></Col>
                  <Col md={1}>
                    <Button size="sm" variant="outline-dark" id="ButU1">
                      Status
                    </Button>
                    {this.state.online ? (
                      <Button
                        variant="outline-success"
                        id="ButU2"
                        onClick={() => this.changeOnlineStatus(false)}
                      >
                        Online
                      </Button>
                    ) : (
                      <Button
                        variant="outline-danger"
                        id="ButU3"
                        onClick={() => this.changeOnlineStatus(true)}
                      >
                        Presence
                      </Button>
                    )}
                  </Col>
                  <Col md={1}>
                    <OverlayTrigger
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
                        size="sm"
                        variant="outline-dark"
                        className="cell"
                        id="ButU4"
                      >
                        A.Year
                      </Button>
                    </OverlayTrigger>
                    <DropdownButton
                      key="secondary"
                      id="DropD1"
                      variant="secondary"
                      title={this.state.year}
                    >
                      {this.state.years?.map((y) => (
                        <Dropdown.Item
                          eventKey="1"
                          onClick={(e) => this.setYear(e.target.textContent)}
                        >
                          {y}
                        </Dropdown.Item>
                      ))}
                    </DropdownButton>
                  </Col>
                  <Col md={1}>
                    <OverlayTrigger
                      key="top"
                      id="Over2"
                      placement="top"
                      overlay={
                        <Tooltip id={`tooltip-top`}>
                          if you select semester you will update all the
                          lectures of the specific semester, "None" means "all
                          the semesters"{" "}
                        </Tooltip>
                      }
                    >
                      <Button size="sm" variant="outline-dark" id="ButU5">
                        Semester
                      </Button>
                    </OverlayTrigger>
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
                  {this.state.insertDate ? (
                    <>
                      <Col md={2}>
                        <Row>
                          <OverlayTrigger
                            key="top"
                            id="OverL3"
                            placement="top"
                            overlay={
                              <Tooltip id={`tooltip-top`}>
                                if start date is selected you will update all
                                the lectures after the specific date, if there
                                is not a Start date it automatically selects the
                                current date
                              </Tooltip>
                            }
                          >
                            <Button size="sm" variant="outline-dark" id="ButU6">
                              Start date
                            </Button>
                          </OverlayTrigger>
                        </Row>
                        <Row>
                          <DatePicker
                            id="start"
                            selected={this.state.start_date}
                            onChange={(date) =>
                              this.selectedDate(date, "start")
                            }
                          />
                        </Row>
                      </Col>
                      <Col md={2}>
                        <Row>
                          <OverlayTrigger
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
                            <Button size="sm" variant="outline-dark" id="ButU7">
                              End date
                            </Button>
                          </OverlayTrigger>
                        </Row>
                        <Row>
                          <DatePicker
                            id="end"
                            selected={this.state.end_date}
                            onChange={(date) => this.selectedDate(date, "end")}
                          />
                        </Row>
                      </Col>
                      <Button
                        id="ButU8"
                        onClick={(e) => this.changeInsertDate(false)}
                      >
                        Remove date
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        id="ButU9"
                        onClick={(e) => this.changeInsertDate(true)}
                      >
                        Insert date
                      </Button>
                    </>
                  )}
                </Row>
                <br></br>
                
                  <Row>
                    <Col md={1}></Col>
                    <Col md={1}>
                      <DialogAlert
                        id="UpL2"
                        dialog={"UpdateList"}
                        onConfirm={() => {
                          this.UpdateFunction();
                        }}
                      />
                    </Col>
                    <Col>
                      <h2>{this.state.response}</h2>
                    </Col>
                  </Row>
                
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
