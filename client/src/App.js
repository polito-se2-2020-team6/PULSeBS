import React from "react";
import "./App.css";
// import { withRouter } from "react-router-dom";
import LoginForm from "./components/LoginPage";
import { AuthContext } from "./auth/AuthContext";
import { USERS } from "./data/fakeUsers";

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
        <div className="App">
          <LoginForm />
        </div>
      </AuthContext.Provider>
    );
  }
}
export default App;
