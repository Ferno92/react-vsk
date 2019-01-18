import React from "react";
import GoogleLogin from "react-google-login";
import ls from "local-storage";
import { firebaseConfig } from "../App";
import firebase from "firebase/app";
import "firebase/database";
import store from "../store/store";
import {updateLoggedUser} from "../actions/actions";
//https://medium.com/@siobhanpmahoney/local-storage-in-a-react-single-page-application-34ba30fc977d
//https://medium.com/@rocksinghajay/login-with-facebook-and-google-in-reactjs-990d818d5dab
//https://reacttraining.com/react-router/web/api/withRouter ?

class Login extends React.Component {
  userRef = null;
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

  render() {
    return (
      <div className="Login">
        <h1>LOGIN WITH GOOGLE</h1>

        {/* <FacebookLogin
        appId="" //APP ID NOT CREATED YET
        fields="name,email,picture"
        callback={responseFacebook}
      /> */}
        <GoogleLogin
          clientId="208284925648-u76mj4ulkproaqu8np57pv2444s8deuh.apps.googleusercontent.com"
          buttonText="LOGIN WITH GOOGLE"
          onSuccess={this.responseGoogle}
          onFailure={this.responseGoogle}
        />
      </div>
    );
  }
}

export default Login;
