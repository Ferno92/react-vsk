import React from "react";
import ls from "local-storage";
import store from "../../store/store";
import { updateAppbar } from "../../actions/actions";
import TextField from "@material-ui/core/TextField";
import "./Profile.scss";

class Profile extends React.Component {
  state = {
    user: {
      email: "",
      familyName: "",
      givenName: "",
      id: "",
      imageUrl: null,
      name: "",
      type: ""
    },
    edit: false,
    password: "",
    confirmPass: ""
  };

  constructor() {
    super();

    store.dispatch(updateAppbar("searchButtonVisible", false));
    store.dispatch(updateAppbar("fabVisible", false));
  }

  componentDidMount() {
    const user = ls.get("user");
    if (user != null) {
      this.setState({ ...this.state, user: user });
    } else {
      this.props.history.push("/");
    }
  }
  handleChange = (type, event) => {};

  render() {
    const disabled = this.state.user.type !== "firebase" || !this.state.edit;
    console.log("disabled", disabled);
    return (
      <div className="profile">
        <img className="image" src={this.state.user.imageUrl} />
        <TextField
          label="Nome e Cognome"
          margin="normal"
          variant="outlined"
          className="name inputs"
          disabled={disabled}
          value={this.state.user.name}
          onChange={this.handleChange("name")}
        />
        <TextField
          label="Email"
          margin="normal"
          variant="outlined"
          className="email inputs"
          disabled={disabled}
          value={this.state.user.email}
          onChange={this.handleChange("name")}
        />
        {this.state.user.type === "firebase" && (
          <div>
            <TextField
              label="Password"
              margin="normal"
              variant="outlined"
              className="password inputs"
              disabled={disabled}
              value={this.state.password}
              onChange={this.handleChange("name")}
            />
            {this.state.edit && 
            (<TextField
              label="Ripeti password"
              margin="normal"
              variant="outlined"
              className="password-confirm inputs"
              value={this.state.confirmPass}
              onChange={this.handleChange("name")}
            />)}
            
          </div>
        )}
        <div className="teams">Squadre: (Coming soon)</div>
        <div className="friends">Amici: (Coming soon)</div>
      </div>
    );
  }
}
export default Profile;
