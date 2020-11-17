import React from "react";
import "./App.css";
import API from "./API/API";
import LoginPage from "./components/LoginPage";
import Teacher from "./components/Teacher";
import Calender from "./components/Calender";
import Navigation from "./components/nav";
import Student from "./components/Student";

import { AuthContext } from "./auth/AuthContext";
import { Route, Switch, withRouter, Redirect } from "react-router-dom";
import { ROLES } from "./data/consts";

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
      // users: USERS,
      studentsList: [],
      lectureList: [],
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
            this.props.history.push("/student/home");
            break;
        }
      })
      .catch((errObj) => {
        console.log(errObj);
      });
  };

  logout = () => {
    return API.userLogout().then(() => {
      this.setState({ authUser: null, authErr: null });
      this.props.history.push("/login");
    });
  };

  //set state from returned list of stuents booked to a lecture
  studentsBooked = (lectureId) => {
    API.getStudentsBooked(lectureId)
      .then((studentsList) => {
        this.setState({
          studentsList: studentsList || [],
        });
      })
      .catch((errorObj) => {
        console.log(errorObj);
      });
  };


  getLectures = (userId) => {
    API.getLectures(userId)
      .then((lectureList) => {
        this.setState({
          lectureList: lectureList || [],
        });
      })
      .catch((errorObj) => {
        console.log(errorObj);
      });
  };

  //delete a lecture as teacher
  deleteLecture = (lectureId) => {
    API.deleteLecture(lectureId)
      .then(() => {
        //get the update list of lectures? and set state?
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
          <Route path="/student/calender">
            <Calender />
          </Route>
          <Route path="/student/home">
            <Student />
          </Route>
          <Redirect from="/" exact to="login" />
        </Switch>
      </AuthContext.Provider>
    );
  }
}
export default withRouter(App);
