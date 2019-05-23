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
import { updateLoggedUser } from "./actions/actions";
import "firebase/auth";
import firebase from "firebase";
// import firebaseBase from 'firebase';
import Profile from "./pages/profile/Profile";
import MyTeams from "./pages/my-teams/MyTeams";
//font awesome region
import { library } from "@fortawesome/fontawesome-svg-core";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrophy } from "@fortawesome/free-solid-svg-icons";
import EditTeam from "./pages/edit-team/EditTeam";
import TeamService from "./service/TeamService";
import NoMatch from "./pages/no-match/NoMatch";
import register from "../registerServiceWorker";
//end font awesome region

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

export const newGuid = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
    var r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export var teamService = null;

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
    library.add(faTrophy);

    this.requestMessagingPermission();
  }

  componentDidMount() {
    teamService = new TeamService();
    teamService.init();
  }

  componentWillUnmount() {
    teamService.clear();
  }

  requestMessagingPermission = () => {
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    const self = this;
    const messaging = firebase.messaging();
    messaging
      .requestPermission()
      .then(function() {
        console.log("Notification permission granted.");
        self.initializeFCMToken();
      })
      .catch(function(err) {
        console.log("Unable to get permission to notify. ", err);
      });
  };

  initializeFCMToken = () => {
    const messaging = firebase.messaging();
    messaging
      .getToken()
      .then(function(currentToken) {
        if (currentToken) {
          this.sendTokenToServer(currentToken);
          console.log("DEBUG!!!! token: " + currentToken);
          // updateUIForPushEnabled(currentToken);
        } else {
          // Show permission request.
          console.log(
            "No Instance ID token available. Request permission to generate one."
          );
          // Show permission UI.
          // updateUIForPushPermissionRequired();
        }
      })
      .catch(function(err) {
        console.log("An error occurred while retrieving token. ", err);
      });
  };

  sendTokenToServer = token => {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "https://react-vsk.herokuapp.com", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(
      JSON.stringify({
        value: token
      })
    );
  };

  loginSuccess = () => {
    this.child.current.showMessage("success", "Login effettuato con successo!");
    var currentState = this.state;
    currentState.logged = true;
    this.setState(currentState);
  };

  logout = () => {
    if (ls.get("user").type === "firebase") {
      if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
      }
      firebase.auth().signOut(); //mock temp
    }
    ls.set("user", null);
    var currentState = this.state;
    currentState.logged = false;
    this.setState(currentState);
    this.child.current.showMessage(
      "success",
      "Logout effettuato con successo!"
    );
    // document.location.href="/"; TODO
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
              hideAppBar={false}
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
              <Route path="/profile" component={Profile} />
              <Route path="/myteams" component={MyTeams} />
              <Route path="/team/:id?/:owner?" component={EditTeam} />
              <Route component={NoMatch} />
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
