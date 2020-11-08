import React from "react";
import {
  Form,
  FormGroup,
  Col,
  Button,
  FormControl,
  Container,
  Row,
} from "react-bootstrap";
import { ROLES } from "../data/consts";
import { AuthContext } from "../auth/AuthContext";

class LoginForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      password: "",
      role: ROLES.TEACHER,
      //   submitted: false,
      //   error: "",
      //   has_error: false,
    };
  }

  handleInputChange = (event) => {
    const target = event.target;
    const value = target.value;
    const name = target.name;

    this.setState({
      [name]: value,
    });
  };

  handleSubmit = (event, onLogin) => {
    event.preventDefault();
    onLogin(this.state.username, this.state.password, this.state.role);
  };

  render() {
    return (
      <AuthContext.Consumer>
        {(context) => (
          <Container fluid className="center center mt-5">
            <Row>
              <Col md={{ span: 4, offset: 4 }}>
                <h3> Select your Role: </h3>

                <Form
                  method="POST"
                  onSubmit={(event) =>
                    this.handleSubmit(event, context.loginUser)
                  }
                >
                  <FormGroup>
                    <select
                      className="form-control"
                      role={this.state.role}
                      onChange={this.handleInputChange}
                      name="role"
                    >
                      <option value="teacher">Teacher</option>
                      <option value="student">Student</option>
                      <option value="teacher">Booking Manager</option>
                      <option value="student">Support Officer</option>
                    </select>
                  </FormGroup>
                  <FormGroup>
                    <FormControl
                      type="text"
                      id="username"
                      name="username"
                      placeholder="Username"
                      value={this.state.username}
                      onChange={this.handleInputChange}
                      required
                      autoFocus
                    />
                  </FormGroup>
                  <FormGroup>
                    <FormControl
                      type="password"
                      id="password"
                      name="password"
                      placeholder="Password"
                      value={this.state.password}
                      onChange={this.handleInputChange}
                      required
                    />
                  </FormGroup>

                  <FormGroup>
                    <Button variant="primary" type="submit" color="primary">
                      Login
                    </Button>
                  </FormGroup>
                </Form>
              </Col>
            </Row>
          </Container>
        )}
      </AuthContext.Consumer>
    );
  }
}

export default LoginForm;
