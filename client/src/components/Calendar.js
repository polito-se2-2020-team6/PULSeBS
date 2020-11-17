import React from "react";
import { Row, Col } from "react-bootstrap";
import "devextreme/dist/css/dx.common.css";
import "devextreme/dist/css/dx.light.css";
import Scheduler from "devextreme-react/scheduler";

const views = ["day", "week"];
const data = [
  {
    text: "Computer Archtecture",
    startDate: new Date(1605426112 * 1000),
    endDate: new Date(1605433312 * 1000),
  },
  {
    text: "BigData",
    startDate: new Date("2020-11-16T13:30:00.000Z"),
    endDate: new Date("2020-11-16T15:30:00.000Z"),
  },
  {
    text: "Software Engineering 2",
    startDate: new Date("2020-11-17T14:00:00.000Z"),
    endDate: new Date("2020-11-17T15:30:00.000Z"),
  },
  {
    text: "Human Computer interaction",
    startDate: new Date("2020-11-17T16:00:00.000Z"),
    endDate: new Date("2020-11-17T17:30:00.000Z"),
  },
];
class calendar extends React.Component {
  componentDidMount() {
    this.props.getCalendar(window.location.href.split("=")[1]);
    console.log(this.props.calendar);
  }
  constructor(props) {
    super(props);
    this.state = {
      date: this.props.calendar.map((e) => ({
        text: e.courseName,
        startDate: new Date(e.startTS).toISOString(),
        endDate: new Date(e.endTS).toISOString(),
      })),
    };
  }

  render() {
    // const calendar = { ...this.props.calendar };
    return (
      <>
        <Row className="clear mt-5">
          <Col xs={1} md={2}></Col>
          <Col xs={4} md={8}>
            <Scheduler
              dataSource={this.state.date}
              defaultCurrentDate={new Date()}
              startDayHour={6}
              endDayHour={19}
              cellDuration={60}
              firstDayOfWeek={1}
              height={750}
              editing={false}
              endDayHour={23}
              views={views}
              defaultCurrentView="week"
            />
          </Col>
          <Col xs={1} md={2}></Col>
        </Row>
      </>
    );
  }
}

export default calendar;
