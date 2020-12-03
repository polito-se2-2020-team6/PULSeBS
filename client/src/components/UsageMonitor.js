import React from "react";
import PieChart, { Series, Label, Connector } from "devextreme-react/pie-chart";
import {
  FormControl,
  FormGroup,
  InputLabel,
  MenuItem,
  Select,
} from "@material-ui/core";
import { Col, Container, Row } from "react-bootstrap";
import API from "../API/API";

class UsageMonitor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      course: "",
      statistics: [],
      areas: [],
    };

    // Warning: findDOMNode is deprecated in StrictMode. findDOMNode was passed an instance of Transition which is inside StrictMode. Instead, add a ref directly to the element you want to reference.
    // this line was added to solve the above problem.
    this.wrapper = React.createRef();
    // this.handleChange = this.handleChange.bind(this);
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

  render() {
    return (
      <Container fluid className="center center mt-5 ">
        <Row>
          <Col className="center center mt-5 " md={{ span: 4, offset: 4 }}>
            <FormGroup>
              <FormControl>
                <InputLabel id="course mb-5">Courses</InputLabel>
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

            <PieChart
              className="mt-5 "
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
          </Col>
        </Row>
      </Container>
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
