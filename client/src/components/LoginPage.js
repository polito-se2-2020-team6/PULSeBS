import React from "react";
import { Form, Col, Container, Row } from "react-bootstrap";
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
import { Redirect } from "react-router-dom";

class LoginPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      password: "",
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
          <>
            {context.authUser && context.authUser.type === 0 && (
              <Redirect
                to={"/student/home?userid=" + context.authUser.userId}
              />
            )}
            {context.authUser && context.authUser.type === 1 && (
              <Redirect to="/teacher/home" />
            )}
            {context.authUser && context.authUser.type === 2 && (
              <Redirect to="/booking-manager/home" />
            )}
            {context.authUser && context.authUser.type === 3 && (
              <Redirect to="/support/home" />
            )}

            <Container fluid className="center center mt-5 ">
              <Row>
                <Col
                  className="center center mt-5 "
                  md={{ span: 4, offset: 4 }}
                >
                  <Form
                    method="POST"
                    onSubmit={(event) =>
                      this.handleSubmit(event, context.loginUser)
                    }
                  >
                    <AppBar position="fixed">
                      <Toolbar>
                        <Typography id="title" variant="h5">
                          Pandemic University Lecture Seat Booking System
                          (PULSeBS)
                        </Typography>
                      </Toolbar>
                    </AppBar>

                    <Row>
                      <Col className="mb-5"></Col>
                    </Row>
                    <Typography
                      id="loginTitle"
                      component="h2"
                      className="mb-3 mt-5"
                    >
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
                        type="submit"
                        color="primary"
                        // size="sm"
                        size="small"
                        variant="contained"
                        className="mt-5"
                        id="login"
                      >
                        login
                      </Button>
                    </FormGroup>
                  </Form>
                </Col>
              </Row>
            </Container>
          </>
        )}
      </AuthContext.Consumer>
    );
  }
}

export default LoginPage;
