import React, { Component } from "react";
import "./App.css";
import BottomAppBar from "./components/BottomAppBar";
import { MuiThemeProvider, createMuiTheme } from "@material-ui/core/styles";
import { Route, Switch } from 'react-router-dom';
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";
import Messages from "./components/Messages";
import ls from "local-storage";

const theme = createMuiTheme({
  palette: {
    primary: {
      light: "#484848",
      main: "#212121",
      dark: "#000000",
      contrastText: "#fff"
    },
    secondary: {
      light: "#fff",
      main: "#fff",
      dark: "#fff",
      contrastText: "#000"
    }
  }
});

class App extends Component {
  child = null;
  state = {
    logged: false
  }

  constructor(props) {
    super(props);
    this.child = React.createRef();
    if (ls.get("user") !== null) {
      this.state.logged = true;
    }
  }

  loginSuccess = () => {
    this.child.current.showMessage("success", "Login effettuato con successo!");
    var currentState = this.state;
    currentState.logged = true;
    this.setState(currentState);
  }

  logout = () => {
    ls.set("user", null);
    var currentState = this.state;
    currentState.logged = false;
    this.setState(currentState);
    this.child.current.showMessage("success", "Logout effettuato con successo!");
  }

  render() {

    const App = () => (
      <div>
        <div>
          <Messages ref={this.child} />
          <MuiThemeProvider theme={theme}>
            <BottomAppBar logged={this.state.logged} logout={this.logout} navigationMenuOpen={false} logoutDialogOpen={false} />
          </MuiThemeProvider>
          <Switch>
            <Route exact path="/" component={Dashboard} />
            <Route path="/login"
              render={(props) => <Login {...props} loginSuccess={this.loginSuccess} />} />
          </Switch>
        </div>
      </div>
    )
    return (
      <Switch>
        <App />
      </Switch>
    );
  }
}

export default App;
