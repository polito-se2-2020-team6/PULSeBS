import React, { Component, Fragment } from "react";
import Spinner from "react-bootstrap/Spinner";
import Button from "react-bootstrap/Button";
import DropdownButton from "react-bootstrap/DropdownButton";
import Dropdown from "react-bootstrap/Dropdown";

class LectureList extends Component {
  state = {};
  render() {
    return (
      <Fragment>
        <main
          role="main"
          className="main p-lg-4 p-xl-4 p-md-4 p-sm-4 col-md-12 ml-sm-auto col-lg-12 px-md-4"
        >
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
            {this.props.lectures.map((lecture) => (
              <Dropdown.Item
                onClick={() => {
                  this.props.filterLectures(lecture.courseId);
                }}
              >
                {lecture.courseName}
              </Dropdown.Item>
            ))}
          </DropdownButton>
          <div className="table-responsive">
            <table className="table table-hover text-center">
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
                {this.props.lectures.map((lecture) => (
                  <LectureRow
                    key={lecture.lectureId}
                    lecture={lecture}
                    bookSeat={this.props.bookSeat}
                    cancelBooking={this.props.cancelBooking}
                    //   onClick={this.props.onClick}
                    bookingProgres={this.props.bookingProgres}
                  />
                ))}
              </tbody>
            </table>
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
        bookingProgres={props.bookingProgres}
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
      <td>{props.lecture.roomName}</td>
      <td>{props.lecture.bookedSeats}</td>
      <td>{props.lecture.totalSeats}</td>
      <td>
        {props.lecture.bookedSelf === false ? (
          <Button
            variant="outline-success"
            onClick={() => {
              props.bookSeat(props.lecture.lectureId);
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
      <td>{props.lecture.inWaitingList === true ?
       'Yes'
       : 
        'No'
       }</td>

      {/*when the button is clicked the spinner will be shown till the data is ready*/}
      {/* <td>
        
          <button
            className="btn btn-outline-success"
            value={props.lecture.courseId}
            onClick={() => {
              props.onClick(props.service.courseId);
            }}
          >
            New Ticket
          </button>
        
      </td> */}
    </>
  );
}

// function IfAvailable(available) {
//   if (available === 0) {
//     return "Not Available";
//   } else {
//     return "Available";
//   }
// }
export default LectureList;
