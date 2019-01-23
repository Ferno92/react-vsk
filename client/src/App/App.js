import React, { Component } from "react";
import "./App.css";
import BottomAppBar from "./components/bottom-appbar/BottomAppBar";
import { MuiThemeProvider, createMuiTheme } from "@material-ui/core/styles";
import { Route, Switch } from "react-router-dom";
import Dashboard from "./pages/dashboard/Dashboard";
import Login from "./pages/login/Login";
import Messages from "./components/Messages";
import ls from "local-storage";
import Match from "./pages/match/Match";
import SearchLive from "./pages/search-live/SearchLive";
import store from "./store/store";
import {updateLoggedUser} from "./actions/actions";
import 'firebase/auth';
import firebase from "firebase/app";

export const theme = createMuiTheme({
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

//  export const firebaseConfig = {
//   apiKey: "AIzaSyDBvxVAYOPwEk2ApbU_DfQ-tmcgOfJ6k4Y",
//   authDomain: "ionicvsk.firebaseapp.com",
//   databaseURL: "https://ionicvsk.firebaseio.com",
//   projectId: "ionicvsk",
//   storageBucket: "",
//   messagingSenderId: "589403062376"
// };
export const firebaseConfig = {
  apiKey: "AIzaSyDO4KLmlNjHJ88eV6bOpH2hHptrBkcD1ko",
  authDomain: "react-pwa-2280e.firebaseapp.com",
  databaseURL: "https://react-pwa-2280e.firebaseio.com",
  projectId: "react-pwa-2280e",
  storageBucket: "react-pwa-2280e.appspot.com",
  messagingSenderId: "522350313041"

};

class App extends Component {
  child = null;
  state = {
    logged: false
  };

  constructor(props) {
    super(props);
    this.child = React.createRef();
    if (ls.get("user") !== null) {
      this.state.logged = true;
      store.dispatch(updateLoggedUser(true));
    }
  }

  loginSuccess = () => {
    this.child.current.showMessage("success", "Login effettuato con successo!");
    var currentState = this.state;
    currentState.logged = true;
    this.setState(currentState);
  };

  logout = () => {
    if(ls.get("user").type === "firebase"){
      
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
      firebase.auth().signOut();//mock temp
    }
    ls.set("user", null);
    var currentState = this.state;
    currentState.logged = false;
    this.setState(currentState);
    this.child.current.showMessage(
      "success",
      "Logout effettuato con successo!"
    );
  };

  render() {
    const App = () => (
      <div>
        <div>
          <Messages ref={this.child} />
          <MuiThemeProvider theme={theme}>
            <BottomAppBar
              logged={this.state.logged}
              logout={this.logout}
              navigationMenuOpen={false}
              logoutDialogOpen={false}
              hideAppBar ={false}
            />
            <Switch>
              <Route exact path="/" component={Dashboard} />
              <Route
                path="/login"
                render={props => (
                  <Login {...props} loginSuccess={this.loginSuccess} />
                )}
              />
              <Route path="/match/:id?/:owner?" component={Match} />
              <Route path="/search" component={SearchLive} />
            </Switch>
          </MuiThemeProvider>
        </div>
      </div>
    );
    return (
      <Switch>
        <App />
      </Switch>
    );
  }
}

export default App;
