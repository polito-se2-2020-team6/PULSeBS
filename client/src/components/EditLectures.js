import React, { Component } from "react";
import Modal from "react-bootstrap/Modal";
import Table from "react-bootstrap/Table";
import Form from "react-bootstrap/Form";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import API from "../API/API";

import Badge from "react-bootstrap/Badge";
import Button from "react-bootstrap/Button";

class EditLectures extends Component {
  state = {
    show: false,
    lectures: [],
  };

  componentDidMount() {
    API.getAllLecturesSO(this.props.courseId)
      .then((lectures) => {
        this.setState({ lectures: lectures });
        console.log(this.state.lectures);
      })
      .catch((err) => console.log(err));
  }
  showDialog = (type) => {
    this.setState({ show: type });
  };
  render() {
    return (
      <>
        <Table className="mt-2" striped bordered hover>
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
            {this.state.lectures.map((lecture) => {
              return (
                <TableRow
                  show={this.state.show}
                  showDialog={this.showDialog}
                  lecture={lecture}
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
  return (
    <tr key={props.lecture.lectureId}>
      <td>1</td>
      <td>{props.lecture.startTS}</td>
      <td>{props.lecture.endTS}</td>
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
      <td>
        <ShowModal
          show={props.show}
          showDialog={props.showDialog}
          id={props.lecture.lectureId}
          lecture={props.lecture}
        />
      </td>
    </tr>
  );
}

function ShowModal(props) {
  return (
    <>
      <Button variant="primary" onClick={() => props.showDialog(true)}>
        Edit Lecture
      </Button>

      <Modal
        key={props.id}
        show={props.show}
        onHide={() => props.showDialog(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit Schedule</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group controlId="formGridState">
            <Form.Label>Day</Form.Label>
            <Form.Control as="select" defaultValue="Choose...">
              <option value='none'>Choose...</option>
              <option value='0'>Monday</option>
              <option value='1'>Tuesday</option>
              <option value='2'>Wednesday</option>
              <option value='3'>Thursday</option>
              <option value='4'>Friday</option>
            </Form.Control>
          </Form.Group>

          <Form.Group>
            <Form.Label>Time</Form.Label>
            <Form.Control type="time" />
          </Form.Group>
          <Form.Group>
            <Form.Label>Start Time</Form.Label>
            <Form.Control type="date" />
          </Form.Group>
          <Form.Group>
            <Form.Label>End Time</Form.Label>
            <Form.Control type="date" />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => props.showDialog(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={() => props.showDialog(false)}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default EditLectures;
