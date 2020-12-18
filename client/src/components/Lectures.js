import React, { Component, Fragment } from "react";
import Spinner from "react-bootstrap/Spinner";
import Button from "react-bootstrap/Button";
import DropdownButton from "react-bootstrap/DropdownButton";
import Dropdown from "react-bootstrap/Dropdown";
import Badge from "react-bootstrap/Badge";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Alert from "react-bootstrap/Alert";
class LectureList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      lectures: [],
    };
  }

  scroll = () => {
      setTimeout(() => {
        document.getElementById("booked").scrollIntoView({
          behavior: "smooth",
        });
      }, 1000);
   
  };

  render() {
    return (
      <Fragment>
        <main
          role="main"
          className="main p-lg-4 p-xl-4 p-md-4 p-sm-4 col-md-12 ml-sm-auto col-lg-12 px-md-4"
        >
            
          <Row xs={2} md={4} lg={6}>
            <Col>
              <DropdownButton
                className="mb-4"
                id="dropdown-basic-button"
                title="Filter Courses"
              >
                <Dropdown.Item
                  onClick={() => {
                    this.props.filterLectures("all");
                  }}
                >
                  All Courses
                </Dropdown.Item>
                {this.props.distincted.map((lecture) => (
                  <Dropdown.Item
                    onClick={() => {
                      this.props.filterLectures(lecture);
                    }}
                  >
                    {lecture}
                  </Dropdown.Item>
                ))}
              </DropdownButton>
            </Col>
            <Col>
              <Button
                variant="info"
                className="ml-n5"
                onClick={() => this.scroll()}
              >
                Booked Lectures
              </Button>
            </Col>
          </Row>
          <div className=" table-responsive">
            <h2 className="mt-5 ml-">Available Lectures</h2>
            <table className="font-size: 22px; table table-striped table-hover text-center">
              <thead>
                <tr className="">
                  <th>Course Name</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Online</th>
                  <th>Teacher</th>
                  <th>Room</th>
                  <th>Booked Seats</th>
                  <th>Total Seats</th>
                  <th>Status</th>
                </tr>
              </thead>
              {this.props.filtered == "" ? (
                <tbody className="lectures-table">
                  {this.props.lectures.map(
                    (lecture) =>
                      !lecture.bookedSelf && (
                        <LectureRow
                          key={lecture.lectureId}
                          lecture={lecture}
                          bookSeat={this.props.bookSeat}
                          cancelBooking={this.props.cancelBooking}
                          //   onClick={this.props.onClick}
                          scroll={this.scroll}
                          show="false"
                          bookingProgres={this.props.bookingProgres}
                        />
                      )
                  )}
                </tbody>
              ) : (
                <tbody>
                  {this.props.filtered.map(
                    (lecture) =>
                      !lecture.bookedSelf && (
                        <LectureRow
                          key={lecture.lectureId}
                          lecture={lecture}
                          bookSeat={this.props.bookSeat}
                          cancelBooking={this.props.cancelBooking}
                          //   onClick={this.props.onClick}
                          scroll={this.scroll}
                          show="false"
                          bookingProgres={this.props.bookingProgres}
                        />
                      )
                  )}
                </tbody>
              )}
            </table>

            <h2 className="mt-5 ml-">Booked Lectures</h2>
            <table id="booked" className="table table-hover text-center">
              <thead>
                <tr className="">
                  <th>Course Name</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Online</th>
                  <th>Teacher</th>
                  <th>Room</th>
                  <th>Booked Seats</th>
                  <th>Total Seats</th>
                  <th>Status</th>
                  <th>In Waiting List</th>
                </tr>
              </thead>
              <tbody>
                {this.props.lectures.map(
                  (lecture) =>
                    lecture.bookedSelf && (
                      <LectureRow
                        key={lecture.lectureId}
                        lecture={lecture}
                        bookSeat={this.props.bookSeat}
                        cancelBooking={this.props.cancelBooking}
                        show="true"
                        bookingProgres={this.props.bookingProgres}
                      />
                    )
                )}
              </tbody>
            </table>
            <AlertDismissibleExample
              failedBooked={this.props.failedBooked}
            />
          </div>
        </main>
      </Fragment>
    );
  }
}
function LectureRow(props) {
  return (
    <tr>
      <LectureData
        lecture={props.lecture}
        bookSeat={props.bookSeat}
        cancelBooking={props.cancelBooking}
        scroll={props.scroll}
        bookingProgres={props.bookingProgres}
        show={props.show}
      />
    </tr>
  );
}

function LectureData(props) {
  return (
    <>
      <td>{props.lecture.courseName}</td>
      <td>{props.lecture.startTS}</td>
      <td>{props.lecture.endTS === false ? "-" : props.lecture.endTS}</td>
      <td>{props.lecture.online === true ? "Online" : "In Person"}</td>
      <td>{props.lecture.teacherName}</td>
      {props.lecture.online ? (
        <td>
          <h4>
            <Badge variant="danger">{props.lecture.roomName}</Badge>
          </h4>
        </td>
      ) : (
        <td>
          <h4>
            <Badge variant="success">{props.lecture.roomName}</Badge>
          </h4>
        </td>
      )}

      <td>{props.lecture.bookedSeats}</td>
      <td>{props.lecture.totalSeats}</td>
      {props.lecture.online === false ? (
        <td>
          {props.lecture.bookedSelf === false ? (
            <Button
              variant="outline-success"
              onClick={() => {
                props.bookSeat(props.lecture.lectureId);
                props.scroll();
              }}
            >
              {props.bookingProgres === 1 ? (
                <Spinner animation="border" size="sm" variant="success" />
              ) : (
                "Book a Seat"
              )}
            </Button>
          ) : (
            <Button
              onClick={() => {
                props.cancelBooking(props.lecture.lectureId);
              }}
              variant="danger"
            >
              Cancel Booking
            </Button>
          )}
        </td>
      ) : (
        <td>
          {" "}
          <Button variant="danger" disabled>
            Online
          </Button>
        </td>
      )}

      {props.show === "false" ? (
        ""
      ) : (
        <td>
          {props.lecture.inWaitingList === true ? (
            <h3>
              {" "}
              <Badge variant="success">Yes</Badge>
            </h3>
          ) : (
            <h3>
              {" "}
              <Badge variant="warning">No</Badge>
            </h3>
          )}
        </td>
      )}
    </>
  );
}

function AlertDismissibleExample(props) {
  if(props.failedBooked === 1)
    {return (
      <Alert variant="danger">
        <Alert.Heading>Booking is Failed, Please Try Again!</Alert.Heading>
      </Alert>
    );}else if (props.failedBooked ===0){
      return('')
    }else{
      return('')
    }
}

export default LectureList;
