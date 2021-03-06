import React from "react";
import ls from "local-storage";
import store from "../../store/store";
import { updateAppbar, showMessageAction } from "../../actions/actions";
import {TextField, Button, Fab, ExpansionPanel, ExpansionPanelSummary, ExpansionPanelDetails, Dialog, CircularProgress, Switch, FormControlLabel} from "@material-ui/core";
import PhotoCamera from "@material-ui/icons/PhotoCamera";
import "./Profile.scss";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { firebaseConfig } from "../../App";
import firebase from "firebase/app";
import "firebase/database";
import "firebase/auth";
import "firebase/storage";
import ImageCompressor from "image-compressor.js";

class Profile extends React.Component {
  
  db = null;
  unsubscribe = null;
  imageFile = null;
  saving = {
    image: true,
    name: true,
    email: true,
    password: true
  };

  constructor() {
    super();
    
    const pushPermission = ls.get("pushPermission");
    this.state = {
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
      loaderCount: 0,
      pushPermissionOn: pushPermission !== null ? pushPermission : false
    };

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
    //TODO: check validate
    if (this.isValid()) {
      this.saving = {
        image: true,
        name: true,
        email: true,
        password: true
      };
      var self = this;
      var imageUrl = self.state.tempUser.imageUrl;
      this.loadingImageDialog(true);
      if (this.state.tempUser.imageUrl !== this.state.user.imageUrl) {
        var imagesRef = firebase
          .storage()
          .ref()
          .child("usersImage/" + this.state.user.id + "/user.jpg");
        var uploadTask = imagesRef.put(this.imageFile);
        uploadTask.then(function(snapshot) {
          imagesRef
            .getDownloadURL()
            .then(function(url) {
              self.setState({
                ...self.state,
                tempUser: { ...self.state.tempUser, imageUrl: url }
              });
              self.updateUserData(url);
            })
            .catch(function(error) {
              console.log(error);
            });
        });
        uploadTask.on("state_changed", function(snapshot) {
          var progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log("Upload is " + progress + "% done");
          self.setState({ ...self.state, loaderCount: progress });
        });
      } else {
        this.updateUserData(imageUrl);
      }
    }
  };

  isValid = () => {
    var valid = false;
    if (this.state.password === this.state.confirmPass) {
      var passwordNotValid = false;
      if (
        this.state.password.trim() !== "" &&
        this.validatePasswordComplex(this.state.password.trim())
      ) {
        valid = true;
      } else if (this.state.password.trim() !== "") {
        //error please fill with valid password

        store.dispatch(
          showMessageAction(
            "error",
            "La password deve contenere almeno 8 caratteri, di cui almeno un numero e una lettera maiuscola"
          )
        );
        passwordNotValid = true;
      }
      if (!passwordNotValid) {
        if (
          this.state.tempUser.name.trim() !== "" &&
          this.state.tempUser.email.trim() !== "" &&
          this.validateEmail(this.state.tempUser.email.trim())
        ) {
          valid = true;
        } else {
          //error please fill with valid email
          store.dispatch(showMessageAction("error", "L'email non è valida"));

          valid = false;
        }
      }
    } else {
      //error password not equal

      store.dispatch(
        showMessageAction("error", "La password di conferma è diversa")
      );
    }
    return valid;
  };

  validateEmail = email => {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };

  validatePasswordComplex = password => {
    return (
      password.trim().length > 7 &&
      /\d/.test(password.trim()) &&
      /[A-Z]/.test(password.trim())
    );
  };

  updateUserData = imageUrl => {
    var self = this;
    var user = firebase.auth().currentUser;
    this.saving.image = false;
    this.saving.name = false;
    user
      .updateProfile({
        displayName: self.state.tempUser.name,
        photoURL: imageUrl
      })
      .then(function() {
        // Success.
        self.saving.image = true;
        self.saving.name = true;
        self.saveCallback();
        self.setState({
          ...self.state,
          edit: !self.state.edit,
          user: self.state.tempUser
        });
        ls.set("user", self.state.tempUser);
        self.db
          .ref("/users/" + ls.get("user").id + "/displayName")
          .set(self.state.tempUser.name);
        self.db
          .ref("/users/" + ls.get("user").id + "/pictureUrl")
          .set(imageUrl);
      })
      .catch(function(error) {
        // An error happened.
        console.log(error);
        self.loadingImageDialog(false);
        store.dispatch(
          showMessageAction("error", "Errore, controlla la connessione..")
        );
      });
    if (self.state.tempUser.password.trim() !== "") {
      //update password
      self.saving.password = false;
      user
        .updatePassword(self.state.tempUser.password)
        .then(function() {
          // Update successful.
          self.saving.password = true;
          self.saveCallback();
        })
        .catch(function(error) {
          // An error happened.
          console.log(error);
          self.loadingImageDialog(false);
          store.dispatch(
            showMessageAction("error", "Errore, controlla la connessione..")
          );
        });
    }
    if (self.state.tempUser.email !== self.state.user.email) {
      //update email
      self.saving.email = false;
      user
        .updateEmail(self.state.tempUser.email)
        .then(function() {
          // Update successful.
          self.saving.email = true;
          self.saveCallback();
        })
        .catch(function(error) {
          // An error happened.
          self.loadingImageDialog(false);
          store.dispatch(
            showMessageAction("error", "Errore, controlla la connessione..")
          );
        });
    }
  };

  saveCallback = () => {
    if (
      this.saving.image &&
      this.saving.name &&
      this.saving.email &&
      this.saving.password
    ) {
      store.dispatch(showMessageAction("success", "Salvato!"));
      this.loadingImageDialog(false);
    }
  };

  handleChange = (type, event) => {
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
      new ImageCompressor(this.imageFile, {
        quality: 0.5,
        success: this.imageCompressCallback
      });
    } else {
      store.dispatch(showMessageAction("error", "Seleziona un immagine."));
    }
  };

  imageCompressCallback = file => {
    this.imageFile = file;
    var reader = new FileReader();
    var self = this;

    reader.onload = function(e) {
      self.setState({
        ...self.state,
        tempUser: { ...self.state.tempUser, imageUrl: e.target.result }
      });
    };

    reader.readAsDataURL(this.imageFile);
  };

  loadingImageDialog = value => {
    this.setState({ ...this.state, loaderVisible: value });
  };

  changePushPermission = (e) =>{
    var checked = e.target.checked
    this.setState({pushPermissionOn: checked})
    if(checked){
      this.subscribeUser()
    }else{
      ls.set("pushPermission", false)
    }
  }

  subscribeUser = () => {
    var self = this;
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(function(reg) {
  
        reg.pushManager.subscribe({
          userVisibleOnly: true
        }).then(function(sub) {
          console.log('Endpoint URL: ', sub.endpoint);
          ls.set("pushPermission", true)
        }).catch(function(e) {
          if (Notification.permission === 'denied') {
            console.warn('Permission for notifications was denied');
            ls.set("pushPermission", false)
            self.setState({pushPermissionOn: false})
          } else {
            console.log(e);
            console.error('Unable to subscribe to push', e);
            ls.set("pushPermission", false)
            self.setState({pushPermissionOn: false})
          }
        });
      })
    }
  }

  render() {
    const {user, edit, tempUser, password, confirmPass, pushPermissionOn, loaderVisible} = this.state
    const disabled = user.type !== "firebase" || !edit;
    return (
      <div className="profile">
        <div
          className="image"
          style={{
            backgroundImage:
              "url(" +
              (edit
                ? tempUser.imageUrl
                : user.imageUrl) +
              ")"
          }}
        />
        {edit && (
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
            edit ? tempUser.name : user.name
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
            edit ? tempUser.email : user.email
          }
          onChange={this.handleChange.bind(this, "email")}
        />
        {user.type === "firebase" && edit && (
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
                type="password"
                value={edit ? tempUser.password : password}
                onChange={this.handleChange.bind(this, "newPass")}
              />
              <TextField
                label="Ripeti password"
                margin="normal"
                variant="outlined"
                className="password-confirm inputs"
                type="password"
                value={edit ? tempUser.confirmPass : confirmPass}
                onChange={this.handleChange.bind(this, "confirmPass")}
              />
            </ExpansionPanelDetails>
          </ExpansionPanel>
        )}
        <div className="teams">Squadre: (Coming soon)</div>
        <div className="friends">Amici: (Coming soon)</div>
        <FormControlLabel
          control={
            <Switch
              checked={pushPermissionOn}
              onChange={this.changePushPermission}
              value="pushPermission"
              color="primary"
            />
          }
          label="Abilità notifiche dell'app"
        />
        <div className="edit-save-container">
          {user.type === "firebase" && edit && (
            <Button
              variant={"outlined"}
              color="primary"
              onClick={this.onEdit}
              className="buttons"
            >
              Annulla
            </Button>
          )}
          {user.type === "firebase" && (
            <Button
              variant={"contained"}
              color="primary"
              onClick={edit ? this.save.bind(this) : this.onEdit}
              className="buttons"
            >
              {edit ? "Salva" : "Modifica"}
            </Button>
          )}
        </div>
        <Dialog
          aria-labelledby="simple-dialog-title"
          open={loaderVisible}
        >
          <div className="dialog-loader">
            <CircularProgress className="loader" />
            <div className="laoder-description">
              Salvataggio dati in corso..
            </div>
          </div>
        </Dialog>
      </div>
    );
  }
}
export default Profile;
