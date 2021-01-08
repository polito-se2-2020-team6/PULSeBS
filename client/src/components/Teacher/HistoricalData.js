import React from "react";
import { Bar } from "react-chartjs-2";
import API from "../../API/API";
import moment from "moment";

import { Redirect } from "react-router-dom";
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

var n = 0;

var months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

class HistoricalData extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      lectures: [],
      detailLevel: "Select detail",
      detailLevelCourse: "Select Course",
      detailLevelPeriod: "Select Period",
      BookedAttendance: "Bookings",
      dataState: {},
      totalLectures: [],
      allCourses: [],
      offset: 1,
      progress: 0,
      maxOffset: 0,
      authUser: {},

    };
    this.wrapper = React.createRef();
  }

  async componentDidMount() {
    this.setState({ progress: 1 });
    await this.isLogged();
    this.getLectures(this.state.authUser.userId);
  }

  isLogged = async () => {
    const response = await API.isLogged();
    try {
      this.setState({ authUser: response, authErr: null });
    } catch (errorObj) {
      this.props.history.push("/login");
      // this.setState({ authErr: err.errorObj });
    }
  };

  getLectures = (userId) => {
    API.getAllLectures(userId)
      .then((lectures) => {
        var today = new Date();
        this.setState({
          totalLectures:
            lectures.filter((l) => new Date(l.startTS) < today) || [],
        });
        this.setState({
          maxOffset: Math.ceil(this.state.totalLectures.length / 10),
        });

        const seen = new Set();
        const filteredArr = this.state.totalLectures.filter((l) => {
          const duplicate = seen.has(l.courseId);
          seen.add(l.courseId);
          return !duplicate;
        });

        if (this.state.totalLectures.length !== 0) {
          this.setState({ allCourses: filteredArr });
          this.setState({
            detailLevelCourse: this.state.allCourses[0].courseName,
          });
        }
        this.setState({ progress: 0 });
      })
      .catch((errorObj) => {
        console.log(errorObj);
      });
  };

  getWeek = () => {
    var date = new Date();
    date.setHours(0, 0, 0, 0);
    // Thursday in current week decides the year.
    date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
    // January 4 is always in week 1.
    var week1 = new Date(date.getFullYear(), 0, 4);
    // Adjust to Thursday in week 1 and count number of weeks from date to week1.
    return (
      1 +
      Math.round(
        ((date.getTime() - week1.getTime()) / 86400000 -
          3 +
          ((week1.getDay() + 6) % 7)) /
          7
      )
    );
  };

  getDateOfWeek = (w, y) => {
    var d = 1 + (w - 1) * 7; // 1st of January + 7 days for each week
    return new Date(y, 0, d);
  };

  getStats = (
    idLecture,
    idCourse,
    period,
    week,
    month,
    year,
    i,
    data,
    tableData
  ) => {
    API.getStats(idLecture, idCourse, period, week, month, year)
      .then((s) => {
        //data.labels[i]=0;
        let l =
          idLecture || idLecture === 0
            ? idLecture +
              " - " +
              this.state.allCourses.find((x) => x.courseId === idCourse)
                .courseName
            : "";
        let m = month || month === 0 ? months[month] + " " + year : "";
        let w =
          week || week === 0
            ? moment(this.getDateOfWeek(week, year)).format("DD/MM/YYYY")
            : "";
        let l1=l? l+"  -  "+this.state.totalLectures.find((x) => x.lectureId === idLecture).startTS:"";
        data.labels[i] = m || w || l;
        data.datasets[0].data[i] = this.state.BookedAttendance==="Bookings"? s.bookingsAvg : console.log("scemotto");
        tableData[i] = { labels: m || w || l1, data: this.state.BookedAttendance==="Bookings"? s.bookingsAvg : s.attendanceAvg };

        if (
          this.state.detailLevel === "Week" ||
          this.state.detailLevel === "Month"
        ) {
          n++;

          if (n >= 10) {
            n = 0;

            this.setState({ dataState: data, lectures: tableData });
            this.setState({ progress: 0 });
          }
        }
        if (this.state.detailLevel === "Lecture") {
          n++;
          let x;

          this.state.totalLectures.length - 10 * (this.state.offset - 1) >= 10
            ? (x = 10)
            : (x =
                this.state.totalLectures.length - 10 * (this.state.offset - 1));
          if (n >= x) {
            n = 0;

            this.setState({ dataState: data, lectures: tableData });
            this.setState({ progress: 0 });
          }
        }
      })
      .catch((errorObj) => {
        console.log(errorObj);
      });
  };

  changeValue(text) {
    this.setState({ progress: 1 });
    var i;
    var data = {
      labels: [],
      datasets: [
        {
          label: "AVG Bookings",
          backgroundColor: "rgb(22, 205, 254)",
          borderColor: "rgb(35, 126, 254)",
          borderWidth: 1,
          hoverBackgroundColor: "rgb(151, 205, 251)",
          hoverBorderColor: "rgb(151, 205, 240)",
          data: [],
        },
      ],
    };
    var tableData = [];
    var date = new Date();

    if (text === "Lecture") {
      for (i = 0; i < 10; i++) {
        let j = this.state.totalLectures.length - 10 * this.state.offset + i;
        if (j >= 0) {
          this.getStats(
            this.state.totalLectures[j].lectureId,
            this.state.totalLectures[j].courseId,
            "",
            "",
            "",
            "",
            i,
            data,
            tableData
          );
        }
      }
    } else if (text === "Week") {
      for (i = 0; i < 10; i++) {
        let week =
          (((this.getWeek() - 10 * this.state.offset + i) % 52) + 52) % 52;
        let year =
          date.getFullYear() -
          Math.abs(
            Math.floor((this.getWeek() - 10 * this.state.offset + i) / 52)
          );
        this.getStats(
          "",
          this.state.allCourses.find(
            (x) => x.courseName === this.state.detailLevelCourse
          ).courseId,
          "week",
          week,
          "",
          year,
          i,
          data,
          tableData
        );
      }
    } else if (text === "Month") {
      for (i = 0; i < 10; i++) {
        let month =
          (((date.getMonth() - 10 * this.state.offset + i) % 12) + 12) % 12;
        let year =
          date.getFullYear() -
          Math.abs(
            Math.floor((date.getMonth() - 10 * this.state.offset + i) / 12)
          );
        this.getStats(
          "",
          this.state.allCourses.find(
            (x) => x.courseName === this.state.detailLevelCourse
          ).courseId,
          "month",
          "",
          month,
          year,
          i,
          data,
          tableData
        );
      }
    }

    this.setState({ detailLevel: text });
  }

  async changeRange(x) {
    if (x > 0) {
      await this.setState({ offset: this.state.offset - 1 });
    } else if (x < 0) {
      await this.setState({ offset: this.state.offset + 1 });
    }
    this.changeValue(this.state.detailLevel);
  }

  async setOffset(detail) {
    await this.setState({ offset: 1 });
    this.changeValue(detail);
  }
  async setAvgBooked(detail) {
    await this.setState({ BookedAttendance: detail });
    //solo se è stato selezionato un detail level chiamo la api per vedere i dati
    if(this.state.detailLevel!=="Select detail"){
      await this.setState({ offset: 1 });
      this.changeValue(this.state.detailLevel);
    }
    
  }

  render() {
    return (
      <AuthContext.Consumer>
        {(context) => (
          <>
            {context.authUser === null && <Redirect to="/login"></Redirect>}
            <>
              {this.state.progress === 1 ? (
                <Row className="justify-content-md-center mt-5">
                  <Spinner animation="border" variant="primary" />
                </Row>
              ) : (
                <>
                  {this.state.totalLectures.length !== 0 ? (
                    <>
                      <Container className="mt-5">
                        <Row>
                          <Col md={2}>
                            <Dropdown>
                              <Dropdown.Toggle
                                variant="success"
                                id="dropdown-basic"
                              >
                                {this.state.detailLevel}
                              </Dropdown.Toggle>

                              <Dropdown.Menu>
                                <Dropdown.Item
                                  id="d1"
                                  onClick={(e) =>
                                    this.setOffset(e.target.textContent)
                                  }
                                >
                                  Lecture
                                </Dropdown.Item>
                                <Dropdown.Item
                                  id="d2"
                                  onClick={(e) =>
                                    this.setOffset(e.target.textContent)
                                  }
                                >
                                  Week
                                </Dropdown.Item>
                                <Dropdown.Item
                                  id="d3"
                                  onClick={(e) =>
                                    this.setOffset(e.target.textContent)
                                  }
                                >
                                  Month
                                </Dropdown.Item>
                              </Dropdown.Menu>
                            </Dropdown>
                          </Col>
                          <Col>
                          <Dropdown>
                              <Dropdown.Toggle
                                variant="success"
                                id="dropdown-basic"
                              >
                                {this.state.BookedAttendance}
                              </Dropdown.Toggle>

                              <Dropdown.Menu>
                                <Dropdown.Item
                                  id="d1"
                                  onClick={(e) =>
                                    this.setAvgBooked(e.target.textContent)
                                  }
                                >
                                  Bookings
                                </Dropdown.Item>
                                <Dropdown.Item
                                  id="d2"
                                  onClick={(e) =>
                                    this.setAvgBooked(e.target.textContent)
                                  }
                                >
                                  Attendances
                                </Dropdown.Item>
                              </Dropdown.Menu>
                            </Dropdown>
                          </Col>
                          <Col md={8}>
                            {this.state.detailLevel === "Lecture" ||
                            this.state.detailLevel === "Select detail" ? (
                              <></>
                            ) : (
                              <Dropdown>
                                <Dropdown.Toggle
                                  variant="success"
                                  id="dropdown-basic1"
                                >
                                  {this.state.detailLevelCourse}
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                  {this.state.allCourses?.map((c) => (
                                    <Dropdown.Item
                                      id={c.courseId + "1"}
                                      key={c.courseId}
                                      onClick={(e) => {
                                        this.setState({
                                          detailLevelCourse:
                                            e.target.textContent,
                                        });
                                        this.setOffset(this.state.detailLevel);
                                      }}
                                    >
                                      {c.courseName}
                                    </Dropdown.Item>
                                  ))}
                                </Dropdown.Menu>
                              </Dropdown>
                            )}
                          </Col>
                          <Col>
                            {this.state.detailLevel === "Select detail" ? (
                              <></>
                            ) : (
                              <Pagination id="pagId2">
                                {this.state.offset >= this.state.maxOffset &&
                                this.state.detailLevel === "Lecture" ? (
                                  <></>
                                ) : (
                                  <Pagination.Prev
                                    id="pagPrevId2"
                                    onClick={() => this.changeRange(-1)}
                                  />
                                )}
                                <Pagination.Item disabled>
                                  {this.state.offset}
                                </Pagination.Item>

                                {this.state.offset <= 1 ? (
                                  <></>
                                ) : (
                                  <Pagination.Next
                                    id="pagNextId2"
                                    onClick={() => this.changeRange(+1)}
                                  />
                                )}
                              </Pagination>
                            )}
                          </Col>
                        </Row>
                        <Row className="mt-3">
                          <Col>
                            <h2 className="text-center">Table Data</h2>
                          </Col>
                        </Row>
                        <Table
                          striped
                          bordered
                          hover
                          size="sm"
                          className="mt-2"
                          id="tabIdd"
                        >
                          <thead>
                            <tr>
                              <th>{this.state.detailLevel}</th>
                              <th>{this.state.BookedAttendance}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {this.state.lectures?.map((l) => (
                              <tr>
                                <td>{l.labels}</td>
                                <td>{l.data}</td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                        <br></br>
                        <br></br>
                        <br></br>
                        <Row>
                          <Col>
                            <h2 className="text-center">Graph Data</h2>
                            <div className="flex flex-col items-center w-full max-w-md">
                              <form name="myForm">
                                <Bar
                                  data={this.state.dataState}
                                  width={100}
                                  height={50}
                                  options={{}}
                                  id="barId"
                                />
                              </form>
                            </div>
                          </Col>
                        </Row>
                      </Container>
                    </>
                  ) : (
                    <>
                      <Row className="justify-content-md-center mt-5">
                        <h2>No data available</h2>
                      </Row>
                    </>
                  )}
                </>
              )}
            </>
          </>
        )}
      </AuthContext.Consumer>
    );
  }
}

HistoricalData.contextType = AuthContext;
export default HistoricalData;
