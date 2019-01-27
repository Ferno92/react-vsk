import React from "react";
import ls from "local-storage";
import store from "../../store/store";
import { updateAppbar, showMessageAction } from "../../actions/actions";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Fab from "@material-ui/core/Fab";
import Edit from "@material-ui/icons/Edit";
import PhotoCamera from "@material-ui/icons/PhotoCamera";
import "./Profile.scss";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import Dialog from "@material-ui/core/Dialog";
import CircularProgress from "@material-ui/core/CircularProgress";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { firebaseConfig } from "../../App";
import firebase from "firebase/app";
import "firebase/database";
import "firebase/auth";
import "firebase/storage";
import ImageCompressor from "image-compressor.js";

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
    tempUser: {},
    loaderVisible: false,
    loaderCount: 0
  };
  db = null;
  unsubscribe = null;
  imageFile = null;

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
        this.unsubscribe = firebase.auth().onAuthStateChanged(function (user) {
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

  componentWillUnmount() {
    if (this.unsubscribe !== null) {
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
    var self = this;
    var imageUrl = self.state.tempUser.imageUrl;
    this.loadingImageDialog(true);
    if (this.state.tempUser.imageUrl !== this.state.user.imageUrl) {
      var imagesRef = firebase
        .storage()
        .ref()
        .child("usersImage/" + this.state.user.id + "/user.jpg");
      var uploadTask = imagesRef.put(this.imageFile);
      uploadTask.then(function (snapshot) {
        console.log("Uploaded a image file!");

        imagesRef
          .getDownloadURL()
          .then(function (url) {
            console.log(url);
            self.setState({...self.state, tempUser: {...self.state.tempUser, imageUrl: url}});
            self.updateUserData(url);
          })
          .catch(function (error) {
            console.log(error);
          });
      });
      uploadTask.on("state_changed", function (snapshot) {
        var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Upload is ' + progress + '% done');
        self.setState({ ...self.state, loaderCount: progress });
      });
    } else {
      this.updateUserData(imageUrl);
    }
  };

  updateUserData = imageUrl => {
    var self = this;
    var user = firebase.auth().currentUser;
    user
      .updateProfile({
        displayName: self.state.tempUser.name,
        photoURL: imageUrl,
        email: self.state.tempUser.email
      })
      .then(function () {
        // Success.
        store.dispatch(showMessageAction("success", "Salvato!"));
        self.setState({
          ...self.state,
          edit: !self.state.edit,
          user: self.state.tempUser
        });
        ls.set("user", self.state.tempUser);
        self.db
          .ref("/users/" + ls.get("user").id + "/displayName")
          .set(self.state.tempUser.name);
        self.db.ref("/users/" + ls.get("user").id + "/pictureUrl").set(imageUrl);

        self.loadingImageDialog(false);
      })
      .catch(function (error) {
        // An error happened.
        console.log(error);
        self.loadingImageDialog(false);
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

  uploadImage = () => {
    var editFab = document.getElementsByClassName("hidden-input");
    editFab[0].click();
  };

  inputImageCallback = evt => {
    this.imageFile = evt.target.files[0];
    if (this.imageFile.type.indexOf("image/") !== -1) {
      new ImageCompressor(this.imageFile, 
        {quality: 0.5, success: this.imageCompressCallback});

    } else {
      showMessageAction("error", "Seleziona un immagine.");
    }
  };

  imageCompressCallback = (file) => {
    this.imageFile = file;
    var reader = new FileReader();
    var self = this;

    reader.onload = function (e) {
      console.log(e.target.result);
      self.setState({
        ...self.state,
        tempUser: { ...self.state.tempUser, imageUrl: e.target.result }
      });
    };

    reader.readAsDataURL(this.imageFile);
  }

  loadingImageDialog = (value) => {
    this.setState({ ...this.state, loaderVisible: value });

  }

  render() {
    const disabled = this.state.user.type !== "firebase" || !this.state.edit;
    console.log("disabled", disabled);
    return (
      <div className="profile">
        <div
          className="image"
          style={{
            backgroundImage:
              "url(" +
              (this.state.edit
                ? this.state.tempUser.imageUrl
                : this.state.user.imageUrl) +
              ")"
          }}
        />
        {this.state.edit && (
          <Fab
            color="primary"
            aria-label="Add"
            className="edit-fab"
            onClick={this.uploadImage.bind(this)}
          >
            <PhotoCamera />
            <input
              className="hidden-input"
              accept="image/*"
              type="file"
              style={{ display: "none" }}
              onChange={this.inputImageCallback.bind(this)}
            />
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
        <Dialog aria-labelledby="simple-dialog-title" open={this.state.loaderVisible}>
        <div className="dialog-loader">
          <CircularProgress className="loader"/>
          <div className="laoder-description">Salvataggio dati in corso..</div>
        </div>
        </Dialog>
      </div>
    );
  }
}
export default Profile;