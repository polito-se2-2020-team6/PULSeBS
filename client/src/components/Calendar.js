import React from "react";
import { Row, Col } from "react-bootstrap";
import "devextreme/dist/css/dx.common.css";
import "devextreme/dist/css/dx.light.css";
import Scheduler from "devextreme-react/scheduler";

const views = ["day", "week"];
class calendar extends React.Component {
  componentDidMount() {
    this.props.getCalendar(window.location.href.split("=")[1]);
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
    return (
      <>
        <Row className="clear mt-5">
          <Col xs={1} md={2}></Col>
          <Col xs={4} md={8}>
            <Scheduler
              dataSource={this.state.date}
              defaultCurrentDate={new Date()}
              startDayHour={7.5}
              endDayHour={19}
              cellDuration={60}
              firstDayOfWeek={1}
              height={750}
              editing={false}
              endDayHour={21.3}
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
