import React from "react";
import "./App.css";
import LoginPage from "./components/LoginPage";
import Teacher from "./components/Teacher";
import Nav from "./components/nav";
import { AuthContext } from "./auth/AuthContext";
import { USERS } from "./data/fakeUsers";
import { Route, Switch, withRouter, Redirect } from "react-router-dom";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      users: USERS,
    };
  }
  login = (username, password, role) => {
    console.log(username, password, role);
    this.state.users.map((e) => {
      if (e.role === role && e.email === username && e.pass === password) {
        return console.log("find");
      }
      return true;
    });
  };

  render() {
    const value = {
      // authUser: this.state.authUser,
      // authErr: this.state.authErr,
      loginUser: this.login,
      logoutUser: this.logout,
    };
    return (
      <AuthContext.Provider value={value}>
        <Nav />
        <Switch>
          <Route path="/login" component={LoginPage}></Route>
          <Route path="/teacher" component={Teacher}></Route>
          {/* <Route path="/student" component={Teacher}></Route> */}
          <Redirect from="/" exact to="login" />
        </Switch>
      </AuthContext.Provider>
    );
  }
}
export default withRouter(App);
