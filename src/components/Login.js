import React from "react";
import GoogleLogin from "react-google-login";
import ls from "local-storage";
//https://medium.com/@siobhanpmahoney/local-storage-in-a-react-single-page-application-34ba30fc977d
//https://medium.com/@rocksinghajay/login-with-facebook-and-google-in-reactjs-990d818d5dab
//https://reacttraining.com/react-router/web/api/withRouter ?

class Login extends React.Component {
  constructor(props, context) {
    super(props, context);
    console.log(ls.get("user"));
    if (ls.get("user") !== null) {
      this.redirectToDashboard(false);
    }
  }

  responseGoogle = response => {
    console.log(response);
    //TODO check error
    if (response.error === undefined) {
      ls.set("user", response.profileObj);
      this.redirectToDashboard(true);
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
