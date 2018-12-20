import React, { Component } from "react";
import "./App.css";
import BottomAppBar from "./components/BottomAppBar";
import { MuiThemeProvider, createMuiTheme } from "@material-ui/core/styles";
import { BrowserRouter as Router, Route } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";

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
  render() {
    return (
      <Router>
        <div>
      <MuiThemeProvider theme={theme}>
        <BottomAppBar />
      </MuiThemeProvider>
      <Route exact path="/" component={Dashboard} />
          <Route path="/login" component={Login} />
        </div>
      </Router>
    );
  }
}

export default App;
