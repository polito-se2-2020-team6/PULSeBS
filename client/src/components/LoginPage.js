import React from "react";
import {
  Form,
  // FormGroup,
  Col,
  // Button,
  // FormControl,
  Container,
  Row,
} from "react-bootstrap";
import { ROLES } from "../data/consts";
import {
  FormControl,
  Input,
  InputLabel,
  FormGroup,
  Button,
  AppBar,
  Typography,
  Toolbar,
} from "@material-ui/core";
import { AuthContext } from "../auth/AuthContext";

class LoginPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      password: "",
      // role: ROLES.TEACHER,
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
    onLogin(this.state.username, this.state.password);
  };

  render() {
    return (
      <AuthContext.Consumer>
        {(context) => (
          <Container fluid className="center center mt-5 ">
            <Row>
              <Col className="center center mt-5 " md={{ span: 4, offset: 4 }}>
                <Form
                  method="POST"
                  onSubmit={(event) =>
                    this.handleSubmit(event, context.loginUser)
                  }
                >
                  <AppBar position="fixed">
                    <Toolbar>
                      <Typography variant="h5">
                        Pandemic University Lecture Seat Booking System
                        (PULSeBS)
                      </Typography>
                    </Toolbar>
                  </AppBar>

                  <Row>
                    <Col className="mb-5"></Col>
                  </Row>
                  <Typography component="h2" className="mb-3 mt-5">
                    Login
                  </Typography>
                  <FormGroup>
                    <FormControl>
                      <InputLabel htmlFor="my-input">Username</InputLabel>
                      <Input
                        id="username"
                        name="username"
                        placeholder="Username"
                        value={this.state.username}
                        onChange={this.handleInputChange}
                        required
                        autoFocus
                        className="mb-3"
                        // aria-describedby="my-helper-text"
                      />
                      {/* <FormHelperText id="my-helper-text">
                        We'll never share your email.
                      </FormHelperText> */}
                    </FormControl>

                    <FormControl>
                      <InputLabel htmlFor="my-input">Password</InputLabel>
                      <Input
                        type="password"
                        id="password"
                        name="password"
                        placeholder="Password"
                        value={this.state.password}
                        onChange={this.handleInputChange}
                        required
                      />
                      {/* <FormHelperText id="my-helper-text">
                      We'll never share your email.
                    </FormHelperText> */}
                    </FormControl>
                  </FormGroup>
                  <FormGroup>
                    <Button
                      block
                      type="submit"
                      color="primary"
                      // size="sm"
                      size="small"
                      variant="contained"
                      className="mt-5"
                    >
                      login
                    </Button>
                  </FormGroup>
                </Form>

                {/* <Form
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
                    <Button
                      block
                      variant="primary"
                      type="submit"
                      color="primary"
                      size="sm"
                    >
                      Login
                    </Button>
                  </FormGroup>
                </Form> */}
              </Col>
            </Row>
          </Container>
        )}
      </AuthContext.Consumer>
    );
  }
}

export default LoginPage;
