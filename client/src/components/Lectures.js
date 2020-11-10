import React, { Component, Fragment } from "react";
import Spinner from "react-bootstrap/Spinner";
import Button from "react-bootstrap/Button";

class LectureList extends Component {
  state = {};
  render() {
    return (
      <Fragment>
        <main
          role="main"
          className="main mt-5 p-lg-4 p-xl-4 p-md-4 p-sm-4 col-md-12 ml-sm-auto col-lg-12 px-md-4"
        >
          <div className="table-responsive">
            <table className="table table-hover text-center">
              <thead>
                <tr className="">
                  <th>#</th>
                  <th>courseId</th>
                  <th>courseName</th>
                  <th>startTs</th>
                  <th>endTs</th>
                  <th>online</th>
                  <th>teacherName</th>
                  <th>roomName</th>
                  <th>bookedSeats</th>
                  <th>totalSeats</th>
                  <th>bookedSelf</th>
                </tr>
              </thead>
              <tbody>
                {this.props.lectures.map((lecture) => (
                  <LectureRow
                    key={lecture.lectureId}
                    lecture={lecture}
                    bookSeat={this.props.bookSeat}
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
    <tr >
      <LectureData
        lecture={props.lecture}
        bookSeat={props.bookSeat}
        bookingProgres={props.bookingProgres}
      />
    </tr>
  );
}
function LectureData(props) {
  return (
    <>
      <td>{props.lecture.lectureId}</td>
      <td>{props.lecture.courseId}</td>
      <td>{props.lecture.courseName}</td>
      <td>{props.lecture.startTS}</td>
      <td>{props.lecture.endTS}</td>
      <td>{props.lecture.online}</td>
      <td>{props.lecture.teacherName}</td>
      <td>{props.lecture.roomName}</td>
      <td>{props.lecture.bookedSeats}</td>
      <td>{props.lecture.totalSeats}</td>
      <td>
        {props.lecture.bookedSelf === 0 ? (
          <Button
            variant="outline-success"
            onClick={() => {
              props.bookSeat(props.lecture.lectureId);
            }}
          >
            {props.bookingProgres === 1 ? (
              <Spinner animation="border" variant="success" />
            ) : (
              "Book a Seat"
            )}
          </Button>
        ) : (
          // <button
          //   type="button"
          //   className="btn btn-primary"
          //   onClick={props.bookSeat}
          // >

          <p>booked</p>
        )}
      </td>

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
