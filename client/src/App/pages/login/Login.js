import React from "react";
import GoogleLogin from "react-google-login";
import ls from "local-storage";
import { firebaseConfig } from "../../App";
import firebase from "firebase/app";
import "firebase/database";
import store from "../../store/store";
import { updateLoggedUser } from "../../actions/actions";
import "./Login.scss";
import FacebookLogin from "react-facebook-login";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Divider from "@material-ui/core/Divider";
//https://medium.com/@siobhanpmahoney/local-storage-in-a-react-single-page-application-34ba30fc977d
//https://medium.com/@rocksinghajay/login-with-facebook-and-google-in-reactjs-990d818d5dab
//https://reacttraining.com/react-router/web/api/withRouter ?

class Login extends React.Component {
  userRef = null;
  state = {
    userError: false,
    passError: false,
    username: "",
    password: ""
  };

  constructor(props, context) {
    super(props, context);
    console.log(ls.get("user"));
    if (ls.get("user") !== null) {
      this.redirectToDashboard(false);
    }
  }

  componentWillUnmount() {
    if (this.userRef !== null) {
      this.userRef.off("value");
    }
  }

  responseFacebook = response => {};

  responseGoogle = response => {
    console.log(response);
    //TODO check error
    if (response.error === undefined) {
      ls.set("user", response.profileObj);
      if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
      }

      this.db = firebase.app().database();

      this.userRef = this.db.ref("/users/" + response.profileObj.googleId);
      var self = this;
      this.userRef.on("value", snapshot => {
        if (snapshot.val() === null) {
          console.log("null user, add info to db");
          const promise = self.userRef.set({
            displayName: response.profileObj.name,
            pictureUrl: response.profileObj.imageUrl
          });
          promise.then(() => {
            store.dispatch(updateLoggedUser(true));
            self.redirectToDashboard(true);
          });
        }
      });
    }
  };

  redirectToDashboard = hasFeedback => {
    if (hasFeedback) {
      this.props.loginSuccess();
    }
    this.props.history.push("/");
  };

  onChange = (type, event) => {
    if (type === "user") {
      this.setState({
        ...this.state,
        username: event.target.value,
        userError: false
      });
    } else {
      this.setState({
        ...this.state,
        password: event.target.value,
        passError: false
      });
    }
  };

  login = () => {
    if (this.validate()) {
    }
  };

  register = () => {
    if (this.validate()) {
    }
  };

  validate = () => {
    var isValid = false;
    var userError = false;
    var passError = false;
    if (this.state.username.trim().length > 0) {
      isValid = true;
    } else {
      userError = true;
    }

    if (this.state.password.trim().length > 0) {
      //validate password with capital letters and numbers
      isValid = isValid ? true : false;
    } else {
      passError = true;
    }

    this.setState({
      ...this.state,
      userError: userError,
      passError: passError
    });
    return isValid;
  };

  render() {
    return (
      <div className="Login">
        <div className="logo-container">
          <img className="login-logo" alt="logo" src="/icon.png" />
          <div className="description">
            Benvenuto! Registrati inserendo username e password che desideri
            usare o effettua il login con le tue credenziali se ti sei già
            registrato.
          </div>
          <TextField
            id="user"
            label="Username"
            margin="normal"
            variant="outlined"
            error={this.state.userError}
            style={{ width: "100%" }}
            onChange={this.onChange.bind(this, "user")}
          />
          {this.state.userError && (
            <div className="error-label">*Inserire username</div>
          )}
          <TextField
            id="pass"
            label="Password"
            margin="normal"
            variant="outlined"
            error={this.state.passError}
            type="password"
            autoComplete="current-password"
            style={{ width: "100%" }}
            onChange={this.onChange.bind(this, "pass")}
          />
          {this.state.passError && (
            <div className="error-label">*Inserire password</div>
          )}
          <div className="button-container">
            <Button variant="contained" color="primary" onClick={this.login}>
              Entra
            </Button>
            <Button
              variant="outlined"
              color="primary"
              onClick={this.register}
              style={{ float: "right" }}
            >
              Registrati
            </Button>
          </div>
        </div>

        <Divider variant="middle" />
        <div className="enter-with">Oppure entra con</div>
        <div className="social-container">
          <div className="social-buttons">
            <FacebookLogin
              appId="" //APP ID NOT CREATED YET
              fields="name,email,picture"
              callback={this.responseFacebook}
            />
          </div>
          <div className="social-buttons">
            <GoogleLogin
              clientId="208284925648-u76mj4ulkproaqu8np57pv2444s8deuh.apps.googleusercontent.com"
              buttonText="LOGIN WITH GOOGLE"
              onSuccess={this.responseGoogle}
              onFailure={this.responseGoogle}
              className="social-buttons"
            />
          </div>
        </div>
      </div>
    );
  }
}

export default Login;
