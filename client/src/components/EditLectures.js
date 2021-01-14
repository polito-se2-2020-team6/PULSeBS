import React, { Component } from "react";
import Table from "react-bootstrap/Table";
import Form from "react-bootstrap/Form";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import API from "../API/API";
import Badge from "react-bootstrap/Badge";
import Button from "react-bootstrap/Button";

class EditLectures extends Component {
  state = {
    show: false,
    lectures: [],
    newDay: null,
    startDate: "",
    endDate: "",
    newTime: "",
    weekday: [],
  };

  componentDidMount() {
    API.getAllLecturesSO(this.props.courseId)
      .then((lectures) => {
        let weekdays = [];
        weekdays = lectures.map((l) => {
          return l.weekday;
        });
        let unique = [...new Set(weekdays)];
        console.log(unique);
        this.setState({ lectures: lectures, weekday: unique });
      })
      .catch((err) => console.log(err));
  }
  showDialog = (id) => {
    document.getElementById(id).classList.toggle("visible");
  };

  changeHandler = (event) => {
    if (event.target.id === "day" && event.target.value !== "choose") {
      this.setState({ newDay: event.target.value });
    } else if (event.target.id === "time") {
      this.setState({ newTime: event.target.value });
    } else if (event.target.id === "endDate") {
      console.log(event.target.value);
      this.setState({ endDate: event.target.value });
    } else if (event.target.id === "startDate") {
      this.setState({ startDate: event.target.value });
    }
  };

  submitHandler = (event) => {
    if (this.state.newDay === null) {
      toast.warn("Please Select A new Day");
    } else {
      API.UpdateSchedule(
        this.props.courseId,
        event.target.id,
        this.state.newDay,
        this.state.newTime,
        this.state.startDate,
        this.state.endDate
      )
        .then((respond) => {
          if (respond.success) {
            toast.success("The Schedule has been updated!");
            this.componentDidMount();
          } else {
            if (respond.reason == "startDateTime cannot be in the past") {
              toast.error("Please Select Correct Start Date");
            } else {
              toast.error("There was an error please Try Again!");
            }
          }
        })
        .catch((err) => console.log(err));
    }
  };

  render() {
    return (
      <>
        <Table
          id="lectures-table"
          className="mt-2 table"
          striped
          bordered
          hover
        >
          <thead>
            <tr>
              <th>#</th>
              <th>Day</th>
              <th>--</th>
              <th>--</th>
              <th>Edit</th>
            </tr>
          </thead>
          <tbody>
            {this.state.weekday.map((w, index) => {
              let count = index + 1;
              return (
                <TableRow
                  show={this.state.show}
                  showDialog={this.showDialog}
                  weekday={w}
                  changeHandler={this.changeHandler}
                  submitHandler={this.submitHandler}
                  count={count}
                  courseId = {this.props.courseId}
                />
              );
            })}
          </tbody>
        </Table>
      </>
    );
  }
}

function TableRow(props) {
  console.log(props.weekday);
  const modalId = props.count;
  const uniqueId = `${props.courseId}-${props.count}` ;
  console.log(uniqueId)
  let weekday;
   switch (props.weekday) {
    case 0:
      weekday="Monday";
      break;
    case 1:
      weekday="Tuesday";
      break;
    case 2:
      weekday="Wednesday";
      break;
    case 3:
      weekday="Thursday";
      break;
    case 4:
      weekday="Friday";
      break;
    default:
  }

  return (
    <>
      <tr key={modalId}>
        <td>{props.count}</td>
        <td>{weekday}</td>
        <td>----</td>
        <td>----</td>
        
        <td>
          <Button
            id="edit-lecture"
            variant="primary"
            onClick={() => props.showDialog(uniqueId)}
          >
            Edit Lecture
          </Button>
        </td>
      </tr>

      <tr id={uniqueId} className="hide">
        <td>
          <Form.Group>
            <Form.Label>Day</Form.Label>
            <Form.Control
              as="select"
              defaultValue="choose"
              id="day"
              onChange={props.changeHandler}
            >
              <option value="choose">Choose A new Day</option>
              <option value="0">Monday</option>
              <option value="1">Tuesday</option>
              <option value="2">Wednesday</option>
              <option value="3">Thursday</option>
              <option value="4">Friday</option>
            </Form.Control>
          </Form.Group>
        </td>
        <td>
          <Form.Group>
            <Form.Label>Time</Form.Label>
            <Form.Control
              id="time"
              type="time"
              onChange={props.changeHandler}
            />
          </Form.Group>
        </td>
        <td>
          <Form.Group>
            <Form.Label>Start Date</Form.Label>
            <Form.Control
              id="startDate"
              type="date"
              onChange={props.changeHandler}
            />
          </Form.Group>
        </td>
        <td>
          <Form.Group>
            <Form.Label>End Date</Form.Label>
            <Form.Control
              id="endDate"
              type="date"
              onChange={props.changeHandler}
            />
          </Form.Group>
        </td>
        <td>
          <Button id={modalId} variant="success" onClick={props.submitHandler}>
            Save Changes
          </Button>
        </td>
      </tr>
    </>
  );
}

export default EditLectures;
