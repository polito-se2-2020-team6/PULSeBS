import React from "react";
import { Row, Col } from "react-bootstrap";
import "devextreme/dist/css/dx.common.css";
import "devextreme/dist/css/dx.light.css";
import Scheduler from "devextreme-react/scheduler";
import API from "../API/API";
const views = ["day", "week"];
class calendar extends React.Component {
  componentDidMount() {
    const studentId = window.location.href.split("=")[1];
    // console.log(studentId);
    API.getLectures(studentId)
      .then((lectures) => {
        // filter those lectures booked with cehcking the bookedSelf
        const filter = lectures.filter((f) => {
          return f.bookedSelf === true;
        });
        // use map to get the right format of the Calendar
        const lecture = filter.map((e) => ({
          text: e.courseName,
          startDate: new Date(e.startTS).toISOString(),
          endDate: new Date(e.endTS).toISOString(),
        }));
        this.setState({ lectures: lecture });
      })
      .catch((err) => console.log(err));
  }
  constructor(props) {
    super(props);
    this.state = {
      lectures: [],
    };
  }

  render() {
    return (
      <>
        <Row className="clear mt-5">
          <Col xs={1} md={2}></Col>
          <Col xs={4} md={8}>
            <Scheduler
              dataSource={this.state.lectures}
              defaultCurrentDate={new Date()}
              startDayHour={7}
              endDayHour={22}
              cellDuration={60}
              firstDayOfWeek={1}
              height={850}
              editing={false}
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
