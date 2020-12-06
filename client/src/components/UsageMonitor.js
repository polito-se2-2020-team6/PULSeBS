import React from "react";
import PieChart, { Series, Label, Connector } from "devextreme-react/pie-chart";
import {
  Chart,
  CommonSeriesSettings,
  Legend,
  Export,
} from "devextreme-react/chart";
import {
  FormControl,
  FormGroup,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@material-ui/core";
import { Col, Container, Row } from "react-bootstrap";
import API from "../API/API";
import { AuthContext } from "../auth/AuthContext";
import { Redirect } from "react-router-dom";
import { dataSource } from "../data/fakeUsers";
class UsageMonitor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      course: "",
      statistics: [],
      areas: [],
      filter: "",
    };

    // Warning: findDOMNode is deprecated in StrictMode. findDOMNode was passed an instance of Transition which is inside StrictMode. Instead, add a ref directly to the element you want to reference.
    // this line was added to solve the above problem.
    this.wrapper = React.createRef();
    // this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    // just to solve the problem of refreshing the page and prevent going to the login Page
    if (!this.props.isStillLogged) {
      this.props.isLogged(true);
    }
  }

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
    console.log(e.target.value);
    const course = e.target.value;
    await this.setState({
      course: course,
    });
    this.getStatesBookManager();
  };
  getStatesBookManager = async () => {
    await API.getStatesBookManager(this.state.course).then((statistics) => {
      this.setState({
        statistics,
      });
      const areas = [
        {
          slice: "Total Bookings",
          area: this.state.statistics.totalBookings,
        },
        {
          slice: "Total Cancellations",
          area: this.state.statistics.totalCancellations,
        },
        {
          slice: "Total Attendances",
          area: this.state.statistics.totalAttendances,
        },
      ];
      this.setState({
        areas: areas,
      });
    });
  };

  // handleToggle = (value) => () => {
  //   console.log(value);
  //   const currentIndex = this.state.checked.indexOf(value);
  //   const newChecked = [...this.state.checked];
  //   if (currentIndex === -1) {
  //     newChecked.push(value);
  //   } else {
  //     newChecked.splice(currentIndex, 1);
  //   }
  //   this.setState({
  //     checked: newChecked,
  //   });
  //   console.log(this.state.checked);
  // };

  handleFilterChange = async (event) => {
    console.log(event.target.value);
    const selectedFIlter = event.target.value;
    await this.setState({
      filter: selectedFIlter,
    });

    // console.log(this.state.filter);
    // setValue(event.target.value);
  };

  render() {
    return (
      <AuthContext.Consumer>
        {(context) => (
          <>
            {context.authUser === null && <Redirect to="/login"></Redirect>}
            <Container className="center center mt-5 ">
              <Typography variant="h1" component="h2">
                {/*  use ? to solve the
                problem of having no data */}
                Welcome Mr.{context.authUser?.lastname}
              </Typography>

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
                        <MenuItem value={1}>Software Engineering I</MenuItem>
                        <MenuItem value={2}>Software Engineering</MenuItem>
                        <MenuItem value={3}>APA`</MenuItem>
                        <MenuItem value={4}>Data Science</MenuItem>
                        <MenuItem value={5}>Web Application</MenuItem>
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
                        <MenuItem value="all">All</MenuItem>
                        <MenuItem value="weekly">Weekly</MenuItem>
                        <MenuItem value="monthly">Monthly</MenuItem>
                      </Select>
                    </FormControl>
                  </FormGroup>

                  {/* <FormControl className="mt-5" component="fieldset">
                    <FormLabel component="legend">Filters</FormLabel>
                    <RadioGroup
                      aria-label="gender"
                      name="gender1"
                      value={this.state.filter}
                      onChange={this.handleFilterChange}
                    >
                      <FormControlLabel
                        value="weekly"
                        control={<Radio />}
                        label="Weekly"
                      />
                      <FormControlLabel
                        value="monthly"
                        control={<Radio />}
                        label="Monthly"
                      />
                    </RadioGroup>
                  </FormControl> */}
                  {/* <List
                    className="mt-5"
                    subheader={<ListSubheader>Filters</ListSubheader>}
                  >
                    <ListItem>
                      <ListItemText id="Weekly" primary="Weekly Statistics" />
                      <ListItemSecondaryAction>
                        <Switch
                          edge="end"
                          onChange={this.handleToggle("weekly")}
                          checked={this.state.checked.indexOf("weekly") !== -1}
                          inputProps={{
                            "aria-labelledby": "switch-list-label-wifi",
                          }}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem>
                      <ListItemText id="Monthly" primary="Monthly Statistics" />
                      <ListItemSecondaryAction>
                        <Switch
                          edge="end"
                          onChange={this.handleToggle("Monthly")}
                          checked={this.state.checked.indexOf("Monthly") !== -1}
                          inputProps={{
                            "aria-labelledby": "switch-list-label-bluetooth",
                          }}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  </List> */}
                </Col>
              </Row>
              <Row>
                <Col className="mt-5">
                  {this.state.filter === "all" && (
                    <PieChart
                      className="mt-3 "
                      id="pie"
                      dataSource={this.state.areas}
                      palette="Bright"
                      //   title="Area of Countries"
                      //   onPointClick={this.pointClickHandler}
                      //   onLegendClick={this.legendClickHandler}
                    >
                      <Series argumentField="slice" valueField="area">
                        <Label visible={true}>
                          <Connector visible={true} width={1} />
                        </Label>
                      </Series>

                      {/* <Size width={500} />
              <Export enabled={true} /> */}
                    </PieChart>
                  )}
                  {this.state.filter === "weekly" && (
                    <Chart
                      id="chart"
                      palette="Soft"
                      title="Weekly Statistics"
                      dataSource={dataSource}
                    >
                      <CommonSeriesSettings
                        argumentField="week"
                        type="bar"
                        ignoreEmptyPoints={true}
                      />
                      <Series valueField="oil" name="Oil Production" />
                      <Series valueField="gas" name="Gas Production" />
                      <Series valueField="coal" name="Coal Production" />
                      <Legend
                        verticalAlignment="bottom"
                        horizontalAlignment="center"
                      />
                      {/* <Export enabled={true} /> */}
                    </Chart>
                  )}
                </Col>
              </Row>
            </Container>
          </>
        )}
      </AuthContext.Consumer>
    );
  }
  //   pointClickHandler(e) {
  //     this.toggleVisibility(e.target);
  //   }

  //   legendClickHandler(e) {
  //     let arg = e.target;
  //     let item = e.component.getAllSeries()[0].getPointsByArg(arg)[0];

  //     this.toggleVisibility(item);
  //   }

  //   toggleVisibility(item) {
  //     item.isVisible() ? item.hide() : item.show();
  //   }
}

export default UsageMonitor;
