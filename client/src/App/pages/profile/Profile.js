import React from "react";
import ls from "local-storage";
import store from "../../store/store";
import { updateAppbar, showMessageAction } from "../../actions/actions";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Fab from "@material-ui/core/Fab";
import Edit from "@material-ui/icons/Edit";
import "./Profile.scss";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { firebaseConfig } from "../../App";
import firebase from "firebase/app";
import "firebase/database";
import "firebase/auth";

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
    confirmPass: "",
    tempUser: {}
  };
  db = null;
  unsubscribe = null;

  constructor() {
    super();

    store.dispatch(updateAppbar("searchButtonVisible", false));
    store.dispatch(updateAppbar("fabVisible", false));
  }

  componentDidMount() {
    const user = ls.get("user");
    if (user != null) {
      if (user.type === "firebase") {
        if (!firebase.apps.length) {
          firebase.initializeApp(firebaseConfig);
        }

        this.db = firebase.app().database();
        var self = this;
        this.unsubscribe = firebase.auth().onAuthStateChanged(function(user) {
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
            ls.set("user", userObj);

            self.setState({ ...self.state, user: userObj });
          }
        });
      } else {
        this.setState({ ...this.state, user: user });
      }
    } else {
      this.props.history.push("/");
    }
  }

  componentWillUnmount(){
      if(this.unsubscribe !== null){
          this.unsubscribe();
      }
  }

  onEdit = () => {
    this.setState({
      ...this.state,
      edit: !this.state.edit,
      tempUser: this.state.user
    });
  };

  save = () => {
    var user = firebase.auth().currentUser;
    var self = this;
    user
      .updateProfile({
        displayName: self.state.tempUser.name,
        photoURL: self.state.tempUser.imageUrl,
        email: self.state.tempUser.email
      })
      .then(function() {
        // Success.
        store.dispatch(showMessageAction("success", "Salvato!"));
        self.setState({
          ...self.state,
          edit: !self.state.edit,
          user: self.state.tempUser
        });
        //TODO: UPDATE DB USERNAME & PHOTO
        self.db
          .ref("/users/" + ls.get("user").id + "/displayName")
          .set(self.state.tempUser.name);
        //   this.db.ref("/users/" + user.id + "/pictureUrl").set(this.state.tempUser.imageUrl);
      })
      .catch(function(error) {
        // An error happened.
        console.log(error);
        store.dispatch(
          showMessageAction("error", "Errore, controlla la connessione..")
        );
      });
  };

  handleChange = (type, event) => {
    console.log(type, event.target.value);
    switch (type) {
      case "name":
        this.setState({
          ...this.state,
          tempUser: { ...this.state.tempUser, name: event.target.value }
        });
        break;
      case "email":
        this.setState({
          ...this.state,
          tempUser: { ...this.state.tempUser, email: event.target.value }
        });
        break;
      default:
        break;
    }
  };

  render() {
    const disabled = this.state.user.type !== "firebase" || !this.state.edit;
    console.log("disabled", disabled);
    return (
      <div className="profile">
        <img className="image" src={this.state.user.imageUrl} />
        {this.state.edit && (
          <Fab color="primary" aria-label="Add" className="edit-fab">
            <Edit />
          </Fab>
        )}
        <TextField
          label="Nome e Cognome"
          margin="normal"
          variant="outlined"
          className="name inputs"
          disabled={disabled}
          value={
            this.state.edit ? this.state.tempUser.name : this.state.user.name
          }
          onChange={this.handleChange.bind(this, "name")}
        />
        <TextField
          label="Email"
          margin="normal"
          variant="outlined"
          className="email inputs"
          disabled={disabled}
          value={
            this.state.edit ? this.state.tempUser.email : this.state.user.email
          }
          onChange={this.handleChange.bind(this, "email")}
        />
        {this.state.user.type === "firebase" && this.state.edit && (
          <ExpansionPanel className="expansion-panel">
            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
              Password
            </ExpansionPanelSummary>
            <ExpansionPanelDetails className="expansion-details">
              <TextField
                label="Nuova password"
                margin="normal"
                variant="outlined"
                className="password inputs"
                disabled={disabled}
                value={this.state.password}
                onChange={this.handleChange.bind(this, "newPass")}
              />
              <TextField
                label="Ripeti password"
                margin="normal"
                variant="outlined"
                className="password-confirm inputs"
                value={this.state.confirmPass}
                onChange={this.handleChange.bind(this, "confirmPass")}
              />
            </ExpansionPanelDetails>
          </ExpansionPanel>
        )}
        <div className="teams">Squadre: (Coming soon)</div>
        <div className="friends">Amici: (Coming soon)</div>
        <div className="edit-save-container">
          {this.state.user.type === "firebase" && this.state.edit && (
            <Button
              variant={"outlined"}
              color="primary"
              onClick={this.onEdit}
              className="buttons"
            >
              Annulla
            </Button>
          )}
          {this.state.user.type === "firebase" && (
            <Button
              variant={"contained"}
              color="primary"
              onClick={this.state.edit ? this.save.bind(this) : this.onEdit}
              className="buttons"
            >
              {this.state.edit ? "Salva" : "Modifica"}
            </Button>
          )}
        </div>
      </div>
    );
  }
}
export default Profile;
