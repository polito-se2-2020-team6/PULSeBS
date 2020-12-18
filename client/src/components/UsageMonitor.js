import React from "react";
import PieChart, {
  Series,
  Label,
  Connector,
  LoadingIndicator,
} from "devextreme-react/pie-chart";
import {
  Chart,
  CommonSeriesSettings,
  Legend,
  ArgumentAxis,
  Tick,
  ValueAxis,
} from "devextreme-react/chart";
import {
  FormControl,
  FormGroup,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from "@material-ui/core";
import Paper from "@material-ui/core/Paper";

import { Col, Container, Row } from "react-bootstrap";
import API from "../API/API";
import { AuthContext } from "../auth/AuthContext";
import { Redirect } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

class UsageMonitor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      course: "",
      statistics: [],
      monthlyStats: [],
      mDataSource: [],
      areas: [],
      filter: "",
      weeklyStatistics: [],
      weekNo: "",
      weeklyDataSource: [],
      weekly: [],
      startDate: new Date(),
      month: "",
      year: "",
      isSelected: false,
      allCourses: [],
      page: 0,
      rowsPerPage: 10,
    };

    // Warning: findDOMNode is deprecated in StrictMode. findDOMNode was passed an instance of Transition which is inside StrictMode. Instead, add a ref directly to the element you want to reference.
    // this line was added to solve the above problem.
    this.wrapper = React.createRef();
    // this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount = async () => {
    // just to solve the problem of refreshing the page and prevent going to the login Page
    if (!this.props.isStillLogged) {
      this.props.isLogged(true);
    }
    await API.getAllCourses().then((allCourses) => {
      const filterCourses = allCourses.courses.filter(
        (ele, ind) =>
          ind === allCourses.courses.findIndex((elem) => elem.name === ele.name)
      );

      this.setState({
        allCourses: filterCourses,
      });
    });
    console.log(this.state.allCourses);
  };

  //   async handleChange(e) {
  //     // setAge(event.target.value);
  //     console.log(e.target.value);
  //     const course = e.target.value;
  //     await this.setState({
  //       course: course,
  //     });
  //     this.getStatesBookManager();
  //   }

  // ----------------------------------------------------------------------
  // imp TIP and USEFUL, add async and await to handle delay of setting the state
  handleChange = async (e) => {
    // console.log(e.target.value);
    const course = e.target.value;
    await this.setState({
      course: course,
      isSelected: false,
    });
    this.getStatesBookManager();
    this.setState({
      filter: "",
    });
  };
  getStatesBookManager = async () => {
    await API.getStatesBookManager(this.state.course).then((statistics) => {
      this.setState({
        statistics,
      });

      // const areas = [
      //   {
      //     slice: "Total Bookings",
      //     area: this.state.statistics.totalBookings,
      //   },
      //   {
      //     slice: "Total Attendances",
      //     area: this.state.statistics.totalAttendances,
      //   },
      //   {
      //     slice: "Total Cancellations",
      //     area: this.state.statistics.totalCancellations,
      //   },
      //   {
      //     slice: "BookingsSD",
      //     area: this.state.statistics.bookingsStdDev.toFixed(2),
      //   },
      //   {
      //     slice: "AttendancesSD",
      //     area: this.state.statistics.attendancesStdDev.toFixed(2),
      //   },
      //   {
      //     slice: "CancellationsSD",
      //     area: this.state.statistics.cancellationsStdDev.toFixed(2),
      //   },
      // ];
      this.setState({
        areas: statistics,
      });
    });
  };

  handleFilterChange = async (event) => {
    console.log(event.target.value);
    const selectedFIlter = event.target.value;
    await this.setState({
      filter: selectedFIlter,
      isSelected: false,
    });
    // this should be called when the user select nothing form the courses seection
    // in this way it shows all statistics for all courses
    if (this.state.filter === "all") {
      this.getStatesBookManager();
    }

    if (this.state.filter === "weekly") {
      for (let i = 0; i < 6; i++) {
        const weekNo = (this.getWeek() - 6 + i) % 52;
        this.setState({
          weekNo,
          // isSelected: false,
        });
        await API.getStatesWeekly(this.state.course, this.state.weekNo).then(
          (weeklyStatistics) => {
            this.setState({
              weeklyStatistics,
            });

            // need to create an Array to push the data recieved from API
            const weeklyDataSource = [];

            weeklyDataSource.push({
              week: this.getDateOfISOWeek(this.state.weekNo, 2020),
              totalBookings: this.state.weeklyStatistics.totalBookings,
              totalCancellations: this.state.weeklyStatistics
                .totalCancellations,
              totalAttendances: this.state.weeklyStatistics.totalAttendances,
            });
            // need another array to have all info related to the entire weeks
            // this array will pass to the chart for filling the data
            let weekly = [...this.state.weekly];
            weekly.push(...weeklyDataSource);
            console.log(this.state.weekly);
            this.setState({
              weekly,
            });

            // console.log(this.state.weekly);
            this.setState({
              weeklyDataSource: this.state.weekly,
            });
          }
        );
      }
    }
    this.setState({
      weekly: [],
    });
  };
  // this funtion receives the date and generate the week of the given date
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

  getDateOfISOWeek = (w, y) => {
    var simple = new Date(y, 0, 1 + (w - 1) * 7);
    var dow = simple.getDay();
    var ISOweekStart = simple;
    if (dow <= 4) ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
    else ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
    return ISOweekStart;
  };

  async setStartDate(date) {
    await this.setState({
      startDate: date,
      isSelected: true,
    });
    await this.setState({
      year: this.state.startDate.getFullYear(),
      month: this.state.startDate.getMonth(),
    });
    console.log(this.state.startDate);
    await API.getStatesMonthly(
      this.state.course,
      this.state.month,
      this.state.year
    ).then((monthlyStats) => {
      this.setState({
        monthlyStats,
      });
      console.log(this.state.monthlyStats);
      const monthData = [
        {
          mStat: "Total Bookings",
          mValue: this.state.monthlyStats.totalBookings,
        },
        {
          mStat: "Total Attendances",
          mValue: this.state.monthlyStats.totalAttendances,
        },
        {
          mStat: "Total Cancellations",
          mValue: this.state.monthlyStats.totalCancellations,
        },
        {
          mStat: "Bookings Average",
          mValue: this.state.monthlyStats.bookingsAvg.toFixed(2),
        },
        {
          mStat: "Cancellations Average",
          mValue: this.state.monthlyStats.cancellationsAvg.toFixed(2),
        },
        {
          mStat: "Attendances Average",
          mValue: this.state.monthlyStats.attendancesAvg.toFixed(2),
        },
        {
          mStat: "Number of Lectures",
          mValue: this.state.monthlyStats.nLectures,
        },
      ];
      this.setState({
        mDataSource: monthData,
      });
    });
  }

  handleChangePage = (event, newPage) => {
    console.log(newPage);
    // setPage(newPage);
    this.setState({
      page: newPage,
    });
  };

  handleChangeRowsPerPage = (event) => {
    // setRowsPerPage(+event.target.value);
    // setPage(0);
    // console.log(event.target.value);
    this.setState({
      rowsPerPage: +event.target.value,
      page: 0,
    });
  };

  render() {
    const { areas } = this.state;
    return (
      <AuthContext.Consumer>
        {(context) => (
          <>
            {context.authUser === null && <Redirect to="/login"></Redirect>}
            <Container className="center center mt-5 ">
              <Typography
                variant="h1"
                component="h2"
                id="welcomeText"
                className="mb-5"
              >
                {/*  use ? to solve the
                problem of having no data */}
                Welcome Mr.{context.authUser?.lastname}
              </Typography>
              <Row>
                <Col>
                  <TableContainer id="teachersTable" component={Paper}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell
                            style={{ fontWeight: "bold" }}
                            align="center"
                          >
                            Course Name
                          </TableCell>
                          <TableCell
                            style={{ fontWeight: "bold" }}
                            align="center"
                          >
                            Teacher First Name
                          </TableCell>
                          <TableCell
                            style={{ fontWeight: "bold" }}
                            align="center"
                          >
                            Teacher Last Name
                          </TableCell>
                          <TableCell
                            style={{ fontWeight: "bold" }}
                            align="center"
                          >
                            Teacher Email
                          </TableCell>
                          <TableCell
                            style={{ fontWeight: "bold" }}
                            align="center"
                          >
                            Teacher ID
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody stripedRows>
                        {this.state.allCourses
                          .slice(
                            this.state.page * this.state.rowsPerPage,
                            this.state.page * this.state.rowsPerPage +
                              this.state.rowsPerPage
                          )
                          .map((row) => (
                            <TableRow
                              // style={
                              //   row.ID % 2
                              //     ? { background: "#a3b687" }
                              //     : { background: "white" }
                              // }
                              key={row.ID}
                            >
                              <TableCell
                                align="center"
                                component="th"
                                scope="row"
                              >
                                {row.name}
                              </TableCell>
                              <TableCell align="center">
                                {row.teacherFirstName}
                              </TableCell>
                              <TableCell align="center">
                                {row.teacherLastName}
                              </TableCell>
                              <TableCell align="center">
                                {row.teacherEmail}
                              </TableCell>
                              <TableCell align="center">
                                {row.teacherId}
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <TablePagination
                    rowsPerPageOptions={[10, 25, 100]}
                    component="div"
                    count={this.state.allCourses.length}
                    rowsPerPage={this.state.rowsPerPage}
                    page={this.state.page}
                    onChangePage={this.handleChangePage}
                    onChangeRowsPerPage={this.handleChangeRowsPerPage}
                  />
                </Col>
              </Row>
              <Row>
                <Col className="center center mt-5" md={{ span: 4, offset: 4 }}>
                  <FormGroup>
                    <FormControl>
                      <InputLabel id="course mb-5">
                        Choose the Course
                      </InputLabel>
                      <Select
                        ref={this.wrapper}
                        labelId="course"
                        id="course"
                        value={this.state.course}
                        onChange={this.handleChange}
                      >
                        <MenuItem value={0}>ALL Courses</MenuItem>
                        {/* get data and fill DropDown Dynamically */}
                        {this.state.allCourses.map((c) => {
                          return <MenuItem value={c.ID}>{c.name}</MenuItem>;
                        })}
                      </Select>
                    </FormControl>
                  </FormGroup>

                  <FormGroup className="mt-3  ">
                    <FormControl>
                      <InputLabel id="filter mb-5">Filter</InputLabel>
                      <Select
                        ref={this.wrapper}
                        labelId="filter"
                        id="filter"
                        value={this.state.filter}
                        onChange={this.handleFilterChange}
                      >
                        <MenuItem value="all">Total Statistics</MenuItem>
                        <MenuItem value="weekly">Weekly Statistics</MenuItem>
                        <MenuItem value="monthly">Monthly Statistics</MenuItem>
                      </Select>
                    </FormControl>
                  </FormGroup>

                  {this.state.filter === "monthly" && (
                    <>
                      <p className="mt-4">
                        Select the Month to generate the Report:{" "}
                      </p>
                      <FormGroup>
                        <FormControl>
                          <DatePicker
                            id="monthDatePicker"
                            selected={this.state.startDate}
                            onChange={(date) => this.setStartDate(date)}
                            dateFormat="MM/yyyy"
                            showMonthYearPicker
                            inline // for showing the specific calendar
                          />
                        </FormControl>
                      </FormGroup>
                    </>
                  )}
                </Col>
              </Row>
              <Row>
                <Col className="mt-5">
                  {this.state.filter === "all" && (
                    <TableContainer id="statisticsTable" component={Paper}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell
                              style={{ fontWeight: "bold" }}
                              align="center"
                            >
                              Total Bookings
                            </TableCell>
                            <TableCell
                              style={{ fontWeight: "bold" }}
                              align="center"
                            >
                              Total Attendances
                            </TableCell>
                            <TableCell
                              style={{ fontWeight: "bold" }}
                              align="center"
                            >
                              Total Cancellations
                            </TableCell>
                            <TableCell
                              style={{ fontWeight: "bold" }}
                              align="center"
                            >
                              BookingsSD
                            </TableCell>
                            <TableCell
                              style={{ fontWeight: "bold" }}
                              align="center"
                            >
                              AttendancesSD
                            </TableCell>
                            <TableCell
                              style={{ fontWeight: "bold" }}
                              align="center"
                            >
                              CancellationsSD
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody stripedRows>
                          <TableRow
                            // style={
                            //   areas.ID % 2
                            //     ? { background: "#a3b687" }
                            //     : { background: "white" }
                            // }
                            key={areas.ID}
                          >
                            <TableCell
                              align="center"
                              component="th"
                              scope="row"
                            >
                              {areas.totalBookings}
                            </TableCell>
                            <TableCell align="center">
                              {areas.totalAttendances}
                            </TableCell>
                            <TableCell align="center">
                              {areas.totalCancellations}
                            </TableCell>

                            <TableCell align="center">
                              {Number(areas.bookingsStdDev).toFixed(2)}
                            </TableCell>
                            <TableCell align="center">
                              {Number(areas.attendancesStdDev).toFixed(2)}
                            </TableCell>
                            <TableCell align="center">
                              {Number(areas.cancellationsStdDev).toFixed(2)}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>

                    //  <TablePagination
                    //    rowsPerPageOptions={[10, 25, 100]}
                    //    component="div"
                    //    count={this.state.allCourses.length}
                    //    rowsPerPage={this.state.rowsPerPage}
                    //    page={this.state.page}
                    //    onChangePage={this.handleChangePage}
                    //    onChangeRowsPerPage={this.handleChangeRowsPerPage}
                    //  />
                    // <PieChart
                    //   title="Total Statistics"
                    //   className="mt-3 "
                    //   id="pie"
                    //   dataSource={this.state.areas}
                    //   palette="Bright"
                    // >
                    //   <Series argumentField="slice" valueField="area">
                    //     <Label visible={true}>
                    //       <Connector visible={true} width={1} />
                    //     </Label>
                    //   </Series>
                    // </PieChart>
                  )}
                  {this.state.filter === "weekly" && (
                    <Chart
                      id="weeklyChart"
                      palette="Soft"
                      title="Weekly Statistics"
                      dataSource={this.state.weeklyDataSource}
                    >
                      <LoadingIndicator enabled={true} />
                      <ArgumentAxis>
                        <Label
                          displayMode="rotate"
                          format="yyyy-MM-dd"
                          rotationAngle="65"
                        />
                      </ArgumentAxis>

                      <CommonSeriesSettings
                        barPadding={0.005}
                        argumentField="week"
                        type="bar"
                        ignoreEmptyPoints={true}
                      />
                      <Series
                        valueField="totalBookings"
                        name="Total Bookings"
                      />
                      <Series
                        valueField="totalCancellations"
                        name="Total Cancellations"
                      />
                      <Series
                        valueField="totalAttendances"
                        name="Total Attendances"
                      />
                      <Legend
                        verticalAlignment="bottom"
                        horizontalAlignment="center"
                      />
                    </Chart>
                  )}
                  {this.state.isSelected === true && (
                    <>
                      <Chart
                        title="Monthly Statistics"
                        dataSource={this.state.mDataSource}
                        rotated={true}
                        id="monthlyChart"
                      >
                        <ArgumentAxis>
                          <Label customizeText={this.customizeText} />
                        </ArgumentAxis>

                        <ValueAxis>
                          <Tick visible={false} />
                          <Label visible={false} />
                        </ValueAxis>

                        <Series
                          valueField="mValue"
                          argumentField="mStat"
                          type="bar"
                          color="#79cac4"
                        >
                          <Label visible={true} backgroundColor="#c18e92" />
                        </Series>

                        <Legend visible={false} />
                      </Chart>
                    </>
                  )}
                </Col>
              </Row>
            </Container>
          </>
        )}
      </AuthContext.Consumer>
    );
  }
}

export default UsageMonitor;
