import React from "react";
import "./App.css";
import API from "./API/API";
import LoginPage from "./components/LoginPage";
import Teacher from "./components/Teacher";
import Calendar from "./components/Calendar";
import Navigation from "./components/nav";
import Student from "./components/Student";
import UsageMonitor from "./components/UsageMonitor";
import { AuthContext } from "./auth/AuthContext";
import { Route, Switch, withRouter, Redirect } from "react-router-dom";
import { ROLES } from "./data/consts";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

class App extends React.Component {
  componentDidMount() {
    API.isLogged()
      .then((user) => {
        this.setState({ authUser: user });
      })
      .catch((err) => {
        this.props.history.push("/login");
        this.setState({ authErr: err.errorObj });
      });
  }

  constructor(props) {
    super(props);
    this.state = {
      // calendar: [],
    };
  }

  login = (username, password) => {
    // this.state.users.map((e) => {
    //   if (e.email === username && e.pass === password) {
    //     this.props.history.push("/teacher");
    //   }
    //   return true;
    // });
    return API.userLogin(username, password)
      .then((user) => {
        switch (user.type) {
          case ROLES.TEACHER:
            this.setState({ authUser: user, authErr: null });
            this.props.history.push("/teacher/home");
            break;
          case ROLES.STUDENT:
            this.setState({ authUser: user, authErr: null });
            // this.getCalendar(this.state.authUser.userId);
            this.props.history.push("/student/home");
            break;
        }
      })
      .catch((errObj) => {
        toast.error("Sorry, the username or password was incorrect.", {
          position: toast.POSITION.BOTTOM_LEFT,
        });
        console.log(errObj);
      });
  };

  logout = () => {
    return API.userLogout().then(() => {
      this.setState({ authUser: null, authErr: null });
      this.props.history.push("/login");
    });
  };

  getCalendar = (userID) => {
    API.getLectures(userID)
      .then((calendar) => {
        this.setState({
          calendar: calendar,
        });
      })
      .catch((errorObj) => {
        console.log(errorObj);
      });
  };

  render() {
    const value = {
      authUser: this.state.authUser,
      authErr: this.state.authErr,
      loginUser: this.login,
      logoutUser: this.logout,
    };
    return (
      <AuthContext.Provider value={value}>
        <Navigation />

        <Switch>
          <Route path="/login" component={LoginPage}></Route>
          <Route path="/teacher/home">
            <Teacher
              studentsList={this.state.studentsList}
              studentsBooked={this.studentsBooked}
              deleteLecture={this.deleteLecture}
              getLectures={this.getLectures}
            />
          </Route>
          <Route path="/student/calendar/">
            <Calendar
              getCalendar={this.getCalendar}
              // calendar={this.state.calendar}
              // user={this.state.authUser}
            />
          </Route>
          <Route path="/student/home">
            <Student user={this.state.authUser} />
          </Route>
          <Route path="/booking-manager/home">
            <UsageMonitor />
          </Route>
          <Redirect from="/" exact to="login" />
        </Switch>
        <ToastContainer autoClose={3500} />
      </AuthContext.Provider>
    );
  }
}
export default withRouter(App);
