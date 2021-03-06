import React from "react";
import GoogleLogin from "react-google-login";
import ls from "local-storage";
import { firebaseConfig } from "../../App";
import firebase from "firebase/app";
import "firebase/database";
import "firebase/auth";
import store from "../../store/store";
import { updateLoggedUser, showMessageAction, updateAppbar } from "../../actions/actions";
import "./Login.scss";
import FacebookLogin from "react-facebook-login";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Divider from "@material-ui/core/Divider";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
//https://medium.com/@siobhanpmahoney/local-storage-in-a-react-single-page-application-34ba30fc977d
//https://medium.com/@rocksinghajay/login-with-facebook-and-google-in-reactjs-990d818d5dab
//https://reacttraining.com/react-router/web/api/withRouter ?
//https://www.robinwieruch.de/complete-firebase-authentication-react-tutorial/#firebase-authentication

class Login extends React.Component {
  userRef = null;
  state = {
    userError: false,
    passError: false,
    email: "",
    password: "",
    showPassword: false
  };

  constructor(props, context) {
    //TODO: IMPROVE SNACKBAR ABSTRACTING MESSAGES?
    //TODO: reset password
    super(props, context);
    if (ls.get("user") !== null) {
      this.redirectToDashboard(false);
    }else{
      store.dispatch(updateAppbar("visible", true));
      store.dispatch(updateAppbar("searchButtonVisible", false));
    }
  }

  componentDidMount() {
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    var self = this;
    firebase.auth().onAuthStateChanged(function(user) {
      console.log("user on firebase: ", user);
      if (user) {
        // User is signed in.

        const userObj = {
          email: user.email,
          familyName: "",
          givenName: "",
          id: user.uid,
          imageUrl: user.photoURL,
          name: user.displayName ? user.displayName : user.email,
          type: "firebase"
        };
        self.saveUser(userObj);
      } else {
        // User is signed out.
      }
    });
  }

  componentWillUnmount() {
    if (this.userRef !== null) {
      this.userRef.off("value");
    }
  }

  responseFacebook = response => {
    //TODO check error
    if (response.error === undefined) {
      const userObj = {
        email: response.email,
        familyName: "",
        givenName: "",
        id: response.userID,
        imageUrl: response.picture.data.url,
        name: response.name ? response.name : response.email,
        type: "facebook"
      };
      this.saveUser(userObj);
    }
  };

  responseGoogle = response => {
    //TODO check error
    if (response.error === undefined) {
      const userObj = {
        email: response.profileObj.email,
        familyName: response.profileObj.familyName,
        givenName: response.profileObj.givenName,
        id: response.googleId,
        imageUrl: response.profileObj.imageUrl,
        name: response.profileObj.displayName
          ? response.profileObj.displayName
          : response.profileObj.givenName +
              " " +
              response.profileObj.familyName ===
            " "
          ? response.profileObj.email
          : response.profileObj.givenName +
            " " +
            response.profileObj.familyName,
        type: "google"
      };
      this.saveUser(userObj);
    }
  };

  saveUser = user => {
    ls.set("user", user);
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }

    this.db = firebase.app().database();

    this.userRef = this.db.ref("/users/" + user.id);
    var self = this;
    this.userRef.on("value", snapshot => {
      if (snapshot.val() === null) {
        console.log("null user, add info to db");
        const promise = self.userRef.set({
          displayName: user.name,
          pictureUrl: user.imageUrl
        });
        promise.then(() => {
          store.dispatch(updateLoggedUser(true));
          self.redirectToDashboard(true);
          store.dispatch(
            showMessageAction("success", "Login effettuato con successo")
          );
        });
      } else {
        store.dispatch(updateLoggedUser(true));
        self.redirectToDashboard(true);
        store.dispatch(
          showMessageAction("success", "Login effettuato con successo")
        );
      }
    });
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
        email: event.target.value,
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
      firebase
        .auth()
        .signInWithEmailAndPassword(this.state.email, this.state.password)
        .catch(error => {
          console.log(error);
          store.dispatch(showMessageAction("error", "Email o password errata"));
        });
    }
  };

  register = () => {
    if (this.validate()) {
      firebase
        .auth()
        .createUserWithEmailAndPassword(this.state.email, this.state.password);
    }
  };

  validate = () => {
    var isValid = false;
    var userError = false;
    var passError = false;
    if (
      this.state.email.trim().length > 0 &&
      this.validateEmail(this.state.email.trim())
    ) {
      isValid = true;
    } else {
      userError = true;
    }

    if (
      this.state.password.trim().length > 7 &&
      /\d/.test(this.state.password.trim()) &&
      /[A-Z]/.test(this.state.password.trim())
    ) {
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

  validateEmail = email => {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };

  onShowPassword = () => {
    this.setState({
      ...this.state,
      showPassword: !this.state.showPassword
    });
  };

  render() {
    return (
      <div className="Login">
        <div className="logo-container">
          <img className="login-logo" alt="logo" src="/icon.png" />
          <div className="description">
            Benvenuto! Registrati inserendo email e password che desideri usare
            o effettua il login con le tue credenziali se ti sei già registrato.
          </div>
          <TextField
            id="user"
            label="Email"
            margin="normal"
            variant="outlined"
            error={this.state.userError}
            style={{ width: "100%" }}
            onChange={this.onChange.bind(this, "user")}
          />
          {this.state.userError && (
            <div className="error-label">*Inserirsci una email valida</div>
          )}
          <TextField
            id="pass"
            label="Password"
            margin="normal"
            variant="outlined"
            error={this.state.passError}
            type={this.state.showPassword ? "normal" : "password"}
            autoComplete="current-password"
            style={{ width: "100%" }}
            onChange={this.onChange.bind(this, "pass")}
          />
          {this.state.passError && (
            <div className="error-label">
              *La password deve contenere almeno 8 caratteri, di cui almeno un
              numero e una lettera maiuscola
            </div>
          )}

          <FormControlLabel
            control={
              <Checkbox
                checked={this.state.showPassword}
                onChange={this.onShowPassword}
                value="show"
                color="primary"
              />
            }
            label="Mostra password"
          />
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
              appId="625220081265152"
              fields="name,email,picture.width(500).height(500)"
              callback={this.responseFacebook}
              auth_type="reauthenticate"
            />
          </div>
          <div className="social-buttons">
            <GoogleLogin
              clientId="343378147790-1kena3ipfeao0cletlripd7vbae975dl.apps.googleusercontent.com"
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
