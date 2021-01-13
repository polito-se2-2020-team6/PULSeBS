import React, { Component } from "react";
import Modal from "react-bootstrap/Modal";
import Table from "react-bootstrap/Table";
import Form from "react-bootstrap/Form";
import Tabs from "react-bootstrap/Tabs";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Tab from "react-bootstrap/Tab";
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
  };

  componentDidMount() {
    API.getAllLecturesSO(this.props.courseId)
      .then((lectures) => {
        this.setState({ lectures: lectures });
      })
      .catch((err) => console.log(err));
  }
  showDialog = (id) => {
    document.getElementById(id).classList.toggle("visible");
  };

  changeHandler = (event) => {
    if (event.target.id === "day") {
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
          console.log(respond);
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
        <Table id="lectures-table" className="mt-2 table" striped bordered hover>
          <thead>
            <tr>
              <th>#</th>
              <th>Start</th>
              <th>End</th>
              <th>Room</th>
              <th>Edit</th>
            </tr>
          </thead>
          <tbody>
            {this.state.lectures.map((lecture,index) => {
              let count = index+1;
              return (
                <TableRow
                  show={this.state.show}
                  showDialog={this.showDialog}
                  lecture={lecture}
                  changeHandler={this.changeHandler}
                  submitHandler={this.submitHandler}
                  count={count}
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
  const modalId = props.lecture.lectureId;
  return (
    <>
      <tr key={props.lecture.lectureId}>
        <td>{props.count}</td>
        <td>{props.lecture.startTS}</td>
        <td>{props.lecture.endTS}</td>
        {props.lecture.online ? (
          <td>
            <h4>
              <Badge id="online-badge" variant="danger">
                {props.lecture.roomName}
              </Badge>
            </h4>
          </td>
        ) : (
          <td>
            <h4>
              <Badge id="presence-badge" variant="success">
                {props.lecture.roomName}
              </Badge>
            </h4>
          </td>
        )}
        <td>
          <Button
            id="edit-lecture"
            variant="primary"
            onClick={() => props.showDialog(modalId)}
          >
            Edit Lecture
          </Button>
        </td>
      </tr>

      {/* <div id={modalId} className="hide">*/}
        <tr id={modalId} className="hide">
          <td>
            <Form.Group>
              <Form.Label>Day</Form.Label>
              <Form.Control
                as="select"
                defaultValue={props.lecture.weekday}
                id="day"
                onChange={props.changeHandler}
              >
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
            <Button
              id={props.lecture.weekday}
              variant="success"
              onClick={props.submitHandler}
            >
              Save Changes
            </Button>
          </td>
        </tr>
      {/*</div> */}
    </>
  );
}

export default EditLectures;
