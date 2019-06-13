import React from "react";
import {
  ArrowBack,
  PersonAdd,
  Close,
  Delete,
  PhotoCamera,
  GroupAdd,
  Edit,
  Done,
  Add
} from "@material-ui/icons";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import {
  Toolbar,
  IconButton,
  AppBar,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails,
  Button,
  Dialog,
  TextField,
  Slide,
  FormControlLabel,
  Checkbox,
  FormGroup,
  Fab
} from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import store from "../../store/store";
import {
  updateAppbar,
  updateCreateMatch,
  showMessageAction
} from "../../actions/actions";
import firebase from "firebase/app";
import "firebase/database";
import { firebaseConfig, newGuid } from "../../App";
import ls from "local-storage";
import "./EditTeam.scss";
import YesNoDialog from "../../components/yesNoDialog/YesNoDialog";
import ImageCompressor from "image-compressor.js";
import EditFormationDialog from "../../components/edit-formation-dialog/EditFormationDialog";
import FormationCard from "../../components/formation-card/FormationCard";
import ContributorCard from "../../components/contributor-card/ContributorCard";
import AddCalendarDialog from "../../components/add-calendar-dialog/AddCalendarDialog";
import CalendarCard from "../../components/calendar-card/CalendarCard";

const styles = theme => ({
  grow: {
    flexGrow: 1
  }
});

function Transition(props) {
  return <Slide direction="up" {...props} />;
}

class EditTeam extends React.Component {
  state = {
    team: null,
    editingPlayer: null,
    editPlayerDialogOpen: false,
    tempEditingPlayer: null,
    deleteDialogOpen: false,
    currentEditFormation: null,
    editFormationOpen: false,
    editName: false,
    readOnly: true,
    contributors: {
      asking: [],
      accepted: []
    },
    usersInfoList: [],
    deleteDialogTitle: "",
    deleteDialogText: "",
    dialogOptions: null,
    dialogType: "",
    openCalendarDialog: false,
    calendar: []
  };
  teamRef = null;
  contributorsRef = null;
  usersRef = null;
  teamRefUrl = '';
  calendarRef = null;

  componentDidMount() {
    store.dispatch(updateCreateMatch("save", false));
    store.dispatch(updateAppbar("visible", false));
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }

    this.db = firebase.app().database();
    var userId = ls.get("user").id;
    if (this.props.match.params.owner) {
      userId = this.props.match.params.owner;
    }
    this.teamRefUrl = "users/" + userId + "/teams/" + this.props.match.params.id
    this.teamRef = this.db.ref(
      this.teamRefUrl
    );
    var self = this;
    this.teamRef.on("value", snapshot => {
      if (snapshot.val() === null) {
        store.dispatch(
          showMessageAction(
            "error",
            "Questa squadra non esiste o è stata eliminata"
          )
        );
        self.props.history.push("/myteams");
      } else {
        self.setState({
          ...self.state,
          team: snapshot.val()
        });
      }
      self.teamRef.off("value");
    });

    this.initContributors(userId);

    this.usersRef = this.db.ref("users");
    this.usersRef.on("value", snapshot => {
      var tempArray = [];
      snapshot.forEach(childSnapshot => {
        var user = childSnapshot.val();
        tempArray.push({
          image: user.pictureUrl,
          name: user.displayName,
          id: childSnapshot.key
        });
      });
      self.setState({ usersInfoList: tempArray });
    });

    
    this.calendarRef = this.db.ref("/calendar"
    );

    this.calendarRef.on("value", snapshot =>{
      var tempCalendar = [];
      snapshot.forEach(childSnapshot => {
        var event = childSnapshot.val();
        event.key = childSnapshot.key;
        tempCalendar.push(event);
      });
      console.log("calendarRef", tempCalendar);
      this.setState({calendar: tempCalendar});
    })
    Notification.requestPermission(function(status) {
      console.log('Notification permission status:', status);
  });
    // const Http = new XMLHttpRequest();
    // const url =
    //   "https://www.cpvolley.it/csi-forli/campionato/1412/misto-open-promozione";
    // Http.open("GET", url);
    // Http.send();
    // Http.onreadystatechange = e => {
    //   console.log(Http.responseText);
    // };
  }

  componentWillUnmount() {
    if (this.teamRef !== null) {
      this.teamRef.off("value");
    }
    if (this.contributorsRef !== null) {
      this.contributorsRef.off("value");
    }
    if (this.usersRef !== null) {
      this.usersRef.off("value");
    }
    if (this.calendarRef !== null) {
      this.calendarRef.off("value");
    }
  }

  initContributors = userId => {
    if (this.contributorsRef === null) {
      this.contributorsRef = this.db.ref(
        "users/" +
          userId +
          "/teams/" +
          this.props.match.params.id +
          "/contributors"
      );
      var self = this;
      this.contributorsRef.on("value", snapshot => {
        var contributors = {
          asking: snapshot.val()
            ? snapshot.val().asking
              ? snapshot.val().asking
              : []
            : [],
          accepted: snapshot.val()
            ? snapshot.val().accepted
              ? snapshot.val().accepted
              : []
            : []
        };
        console.log("contributors", contributors);
        self.setState({
          contributors: contributors,
          readOnly:
            this.props.match.params.owner !== undefined &&
            contributors.accepted.indexOf(ls.get("user").id) === -1
        });
      });
    }
  };

  onBack() {
    if (window.history.length > 0) {
      window.history.back();
    } else {
      this.props.history.push("/");
    }
  }

  addPlayer = player => {
    if (player === null) {
      player = {
        id: "", //new guid
        name: "",
        number: "",
        onEdit: true
      };
    }
    this.setState({
      ...this.state,
      editingPlayer: player,
      tempEditingPlayer: player,
      editPlayerDialogOpen: true
    });
  };

  onCloseEditPlayer = () => {
    this.setState({
      ...this.state,
      editingPlayer: null,
      editPlayerDialogOpen: false
    });
  };

  onSaveEditPlayer = () => {
    if (this.isValid()) {
      var tempPlayers = this.state.team.players.slice();
      for (var i = 0; i < tempPlayers.length; i++) {
        if (tempPlayers[i].id === this.state.tempEditingPlayer.id) {
          tempPlayers[i].name = this.state.tempEditingPlayer.name;
          tempPlayers[i].number = this.state.tempEditingPlayer.number;
          if (this.state.tempEditingPlayer.roles.length > 0) {
            tempPlayers[i].roles = this.state.tempEditingPlayer.roles;
          }
        }
      }
      var isNew = false;
      if (this.state.editingPlayer.id === "") {
        isNew = true;
      }
      if (isNew) {
        tempPlayers.push({
          name: this.state.tempEditingPlayer.name,
          number: this.state.tempEditingPlayer.number,
          id: newGuid(),
          roles: this.state.tempEditingPlayer.roles
        });
      }
      var tempTeam = JSON.parse(JSON.stringify(this.state.team));
      tempTeam.players = tempPlayers;
      var newEditPlayer = JSON.parse(
        JSON.stringify(this.state.tempEditingPlayer)
      );
      newEditPlayer.onEdit = false;
      this.setState(oldState => ({
        ...oldState,
        team: tempTeam,
        editingPlayer: isNew ? null : newEditPlayer,
        editPlayerDialogOpen: isNew ? false : true
      }));
      this.teamRef.set(tempTeam);
      store.dispatch(showMessageAction("success", "Salvato"));
    } else {
      store.dispatch(showMessageAction("error", "Dati mancanti!"));
    }
  };

  isValid = () => {
    return (
      this.state.tempEditingPlayer.name.trim() !== "" &&
      this.state.tempEditingPlayer.number !== ""
    );
  };

  onChangePlayerInfo = (type, evt) => {
    switch (type) {
      case "number":
        this.setState({
          ...this.state,
          tempEditingPlayer: {
            ...this.state.tempEditingPlayer,
            number: evt.target.value
          }
        });
        break;
      case "name":
        this.setState({
          ...this.state,
          tempEditingPlayer: {
            ...this.state.tempEditingPlayer,
            name: evt.target.value
          }
        });
        break;
      default:
        break;
    }
  };

  deletePlayer = () => {
    var tempPlayers = this.state.team.players.slice();
    var index = -1;
    for (var i = 0; i < tempPlayers.length; i++) {
      if (tempPlayers[i].id === this.state.tempEditingPlayer.id) {
        index = i;
      }
    }
    tempPlayers.splice(index, 1);
    var tempTeam = JSON.parse(JSON.stringify(this.state.team));
    tempTeam.players = tempPlayers;
    this.setState(oldState => ({
      ...oldState,
      team: tempTeam,
      editPlayerDialogOpen: false,
      deleteDialogOpen: false
    }));
    console.log(tempTeam);
    this.teamRef.set(tempTeam);

    store.dispatch(
      showMessageAction("success", "Giocatore eliminato dalla squadra")
    );
  };

  isRoleChecked = type => {
    var checked = false;
    if (this.state.editingPlayer) {
      var player = this.state.editingPlayer.onEdit
        ? this.state.tempEditingPlayer
        : this.state.editingPlayer;
      if (player && player.roles) {
        for (var i = 0; i < player.roles.length; i++) {
          var role = player.roles[i];
          if (role === type) {
            checked = true;
          }
        }
      }
    }
    return checked;
  };

  onChangeRole = type => {
    var roles = [];
    var player = this.state.editingPlayer.onEdit
      ? this.state.tempEditingPlayer
      : this.state.editingPlayer;
    if (this.state !== null && player !== null) {
      if (player.roles && player.roles.indexOf(type) < 0) {
        roles = player.roles.slice();
        roles.push(type);
        this.setState({
          ...this.state,
          tempEditingPlayer: { ...this.state.tempEditingPlayer, roles: roles }
        });
      } else if (!player.roles) {
        roles = [type];
      } else {
        roles = player.roles.slice();
        roles.splice(roles.indexOf(type), 1);
      }
      this.setState({
        ...this.state,
        tempEditingPlayer: { ...this.state.tempEditingPlayer, roles: roles }
      });
    }
  };

  setOnEditPlayer = () => {
    this.setState({
      ...this.state,
      editingPlayer: {
        ...this.state.editingPlayer,
        onEdit: !this.state.editingPlayer.onEdit
      },
      tempEditingPlayer: this.state.editingPlayer
    });
  };

  toggleDeleteDialog = (title, text, dialog, options) => {
    this.setState({
      ...this.state,
      deleteDialogOpen: !this.state.deleteDialogOpen,
      deleteDialogTitle: title ? title : "",
      deleteDialogText: text ? text : "",
      dialogType: dialog,
      dialogOptions: options
    });
  };

  cancel = () => {
    if (this.state.editingPlayer.id === "") {
      this.onCloseEditPlayer();
    } else {
      this.setOnEditPlayer();
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
        team: { ...self.state.team, pictureUrl: e.target.result }
      });
      var imagesRef = firebase
        .storage()
        .ref()
        .child("teamImage/" + self.state.team.id + "/team.jpg");
      var uploadTask = imagesRef.put(self.imageFile);
      uploadTask.then(function(snapshot) {
        imagesRef
          .getDownloadURL()
          .then(function(url) {
            self.setState({
              ...self.state,
              team: { ...self.state.team, pictureUrl: url }
            });
            var tempTeam = JSON.parse(JSON.stringify(self.state.team));
            tempTeam.pictureUrl = url;
            self.teamRef.set(tempTeam);
          })
          .catch(function(error) {
            console.log(error);
          });
      });
    };

    reader.readAsDataURL(this.imageFile);
  };

  addFormation = formation => {
    this.setState({
      ...this.state,
      currentEditFormation: formation,
      editFormationOpen: true
    });
  };

  closeEditFormation = () => {
    this.setState({
      ...this.state,
      editFormationOpen: !this.state.editFormationOpen,
      currentEditFormation: null
    });
  };

  editName = () => {
    this.setState({ ...this.state, editName: !this.state.editName });
  };

  saveName = () => {
    this.teamRef.set(this.state.team);
    this.editName();
  };

  onChangeName = evt => {
    this.setState({
      ...this.state,
      team: { ...this.state.team, name: evt.target.value }
    });
  };

  saveFormation = formation => {
    var tempTeam = JSON.parse(JSON.stringify(this.state.team));
    var index = -1;
    tempTeam.formations.forEach((item, i) => {
      if (item.id === formation.id) {
        index = i;
      }
    });
    if (index >= 0) {
      tempTeam.formations[index] = formation;
    } else {
      tempTeam.formations.push(formation);
    }
    this.teamRef.set(tempTeam);
    this.setState({
      ...this.state,
      editFormationOpen: !this.state.editFormationOpen,
      currentEditFormation: null,
      team: { ...this.state.team, formations: tempTeam.formations }
    });

    store.dispatch(showMessageAction("success", "Formazione salvata"));
  };

  deleteFormation = formation => {
    var tempTeam = JSON.parse(JSON.stringify(this.state.team));
    var index = -1;
    tempTeam.formations.forEach((item, i) => {
      if (item.id === formation.id) {
        index = i;
      }
    });
    if (index >= 0) {
      tempTeam.formations.splice(index, 1);
      this.teamRef.set(tempTeam);
      this.setState({
        ...this.state,
        editFormationOpen: !this.state.editFormationOpen,
        currentEditFormation: null,
        team: { ...this.state.team, formations: tempTeam.formations }
      });
      store.dispatch(showMessageAction("success", "Formazione eliminata"));
    }
  };

  askContribution = () => {
    var asking = this.state.contributors.asking.slice();
    asking.push(ls.get("user").id);

    this.contributorsRef.set({
      asking: asking,
      accepted: this.state.contributors.accepted
    });
  };

  acceptContributor = id => {
    var asking = this.state.contributors.asking.slice();
    asking.splice(asking.indexOf(id), 1);
    var accepted = this.state.contributors.accepted.slice();
    accepted.push(id);
    this.contributorsRef.set({
      asking: asking,
      accepted: accepted
    });
  };
  removeContributor = options => {
    var asking = this.state.contributors.asking.slice();
    var accepted = this.state.contributors.accepted.slice();
    if (options.isAsking) {
      asking.splice(asking.indexOf(options.id), 1);
    } else {
      accepted.splice(accepted.indexOf(options.id), 1);
    }

    this.contributorsRef.set({
      asking: asking,
      accepted: accepted
    });
    this.setState({
      deleteDialogOpen: false
    });
  };

  dialogYesAction = () => {
    if (this.state.dialogType === "delete") {
      this.deletePlayer();
    } else if (this.state.dialogType === "remove-contributor") {
      this.removeContributor(this.state.dialogOptions);
    } else if (this.state.dialogType === "delete-team") {
      this.removeTeam();
    }
  };

  removeTeam = () => {
    this.teamRef.remove();

    this.setState({
      deleteDialogOpen: false
    });

    this.props.history.push("/myteams");
  };

  addCalendarEvent = () => {
  };

  toggleCalendarDialog = () => {
    const {openCalendarDialog} = this.state;
    this.setState({openCalendarDialog: !openCalendarDialog});
  };

  addGameOnCalendar = (date, where, opponents) =>{
    console.log(date, where, opponents);
    this.setState({openCalendarDialog: false});
    this.calendarRef.push({date: date.toString(), where: where, opponents: opponents});
  }

  onClickDate = ()=>{
    console.log("onClickDate", Date.now());
    if (Notification.permission == 'granted') {
      navigator.serviceWorker.getRegistration().then(function(reg) {
        var options = {
          body: 'Hey questo è un evento bellissimo!',
          icon: '../public/icon.png',
          vibrate: [100, 50, 100],
          data: {
            dateOfArrival: 1557991551000,
            primaryKey: 1
          },
          actions: [
            {action: 'explore', title: 'Open',
              icon: '../images/done.svg'},
            {action: 'close', title: 'Close',
              icon: '../images/clear.svg'},
          ]
        };
        reg.showNotification('Hello world!', options);
      });
    }
  }

  render() {
    const { classes } = this.props;
    const {
      usersInfoList,
      readOnly,
      team,
      editingPlayer,
      contributors,
      editName,
      editFormationOpen,
      deleteDialogOpen,
      deleteDialogText,
      deleteDialogTitle,
      editPlayerDialogOpen,
      currentEditFormation,
      tempEditingPlayer,
      openCalendarDialog,
      calendar
    } = this.state;
    var players = team !== null && team.players ? team.players : [];
    var formations =
      team !== null && team.formations !== null && team.formations !== undefined
        ? team.formations
        : [];
    players.sort(function(a, b) {
      return parseInt(a.number) - parseInt(b.number);
    });
    var onEditPlayer = editingPlayer ? editingPlayer.onEdit : false;

    var isOwner =
      this.props.match.params.owner === undefined ||
      this.props.match.params.owner === ls.get("user").id;
    var isAsking = contributors.asking.indexOf(ls.get("user").id) >= 0;
    return (
      <div>
        <AppBar position="fixed" color="primary">
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="Menu"
              onClick={this.onBack.bind(this)}
            >
              <ArrowBack />
            </IconButton>
            <Typography
              variant="h6"
              color="inherit"
              className={classes.grow + " title-ellipsis"}
            >
              {team ? team.name : ""}
            </Typography>
            {isOwner && (
              <IconButton
                color="secondary"
                onClick={this.toggleDeleteDialog.bind(
                  this,
                  "Elimina squadra",
                  "Sei sicuro di voler eliminare questa squadra?",
                  "delete-team"
                )}
              >
                <Delete />
              </IconButton>
            )}
          </Toolbar>
        </AppBar>
        <div className="team-info">
          {team !== null && readOnly ? (
            isAsking ? (
              <div className="asking-message">
                La tua richiesta di collaborazione è stata inviata
              </div>
            ) : (
              <div className="no-contributor-message">
                Non sei ancora un collaboratore o sei stato rimosso
              </div>
            )
          ) : (
            ""
          )}
          {!editName && (
            <h1 className="team-title">
              {team ? team.name : ""}
              {!readOnly && (
                <Button
                  variant="outlined"
                  className="edit-team-name"
                  onClick={this.editName.bind(this)}
                >
                  <Edit />
                </Button>
              )}
            </h1>
          )}

          {editName && (
            <div>
              <TextField
                label="Nome squadra"
                margin="normal"
                variant="outlined"
                className="name inputs"
                value={team ? team.name : ""}
                onChange={this.onChangeName.bind(this)}
              />
              <Button
                variant="outlined"
                className="edit-team-name save"
                onClick={this.saveName.bind(this)}
              >
                <Done />
              </Button>
            </div>
          )}
          <div
            className="team-image"
            style={{
              backgroundImage: "url(" + (team ? team.pictureUrl : "") + ")"
            }}
          >
            {!readOnly && (
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
          </div>

          <ExpansionPanel className="expansion-panel">
            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
              Giocatori ({players.length})
            </ExpansionPanelSummary>
            <ExpansionPanelDetails
              className="expansion-details"
              style={{ display: "block" }}
            >
              {!readOnly && (
                <div style={{ margin: "0 auto", width: "fit-content" }}>
                  <Button onClick={this.addPlayer.bind(this, null)}>
                    <PersonAdd /> Aggiungi giocatore
                  </Button>
                </div>
              )}

              {players.map((player, index) => {
                return (
                  <Card className="player-card" key={index}>
                    <CardActionArea onClick={this.addPlayer.bind(this, player)}>
                      <CardContent className="card-content">
                        <div className="player-number float-left">
                          {player.number}
                        </div>
                        <div className="float-left">
                          <div className="player-name">{player.name}</div>
                          <div className="player-role">
                            {player.roles
                              ? player.roles.map((role, index) => {
                                  return (
                                    role +
                                    (index !== player.roles.length - 1
                                      ? ", "
                                      : "")
                                  );
                                })
                              : "Nessun ruolo"}
                          </div>
                        </div>

                        <div className="clear" />
                      </CardContent>
                    </CardActionArea>
                  </Card>
                );
              })}
            </ExpansionPanelDetails>
          </ExpansionPanel>

          <ExpansionPanel className="expansion-panel" color="primary">
            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
              Formazioni salvate ({formations.length})
            </ExpansionPanelSummary>
            <ExpansionPanelDetails
              className="expansion-details"
              style={{ display: "block" }}
            >
              <div style={{ margin: "0 auto", width: "fit-content" }}>
                {!readOnly && (
                  <Button
                    onClick={this.addFormation.bind(this, null)}
                    style={{ marginBottom: "5px" }}
                  >
                    <GroupAdd /> Aggiungi Formazione
                  </Button>
                )}
              </div>
              {formations.map((formation, index) => {
                // formation.players.sort(function(a, b) {
                //   return a.number - b.number;
                // });
                return (
                  <FormationCard
                    formation={formation}
                    addFormation={this.addFormation}
                    key={index}
                    players={team.players}
                  />
                );
              })}
            </ExpansionPanelDetails>
          </ExpansionPanel>
          <ExpansionPanel className="expansion-panel" color="primary">
            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
              Collaboratori ({contributors.accepted.length})
            </ExpansionPanelSummary>
            <ExpansionPanelDetails
              className="expansion-details"
              style={{ display: "block" }}
            >
              {contributors.accepted.map((accepted, index) => {
                var users = usersInfoList.filter(usersInfo => {
                  return usersInfo.id === accepted;
                });
                var user = null;
                if (users.length > 0) {
                  user = users[0];
                }
                return user !== null ? (
                  <ContributorCard
                    key={accepted}
                    image={user.image}
                    name={user.name}
                    isAsking={false}
                    acceptContributor={this.acceptContributor.bind(
                      this,
                      accepted
                    )}
                    removeContributor={this.toggleDeleteDialog.bind(
                      this,
                      "Rimuovi collaboratore",
                      "Sei sicuro di voler rimuovere questo collaboratore?",
                      "remove-contributor",
                      { id: accepted, isAsking: false }
                    )}
                    owner={isOwner}
                  />
                ) : (
                  ""
                );
              })}
            </ExpansionPanelDetails>
          </ExpansionPanel>
          {isOwner && (
            <ExpansionPanel className="expansion-panel" color="primary">
              <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                Richieste ({contributors.asking.length})
              </ExpansionPanelSummary>
              <ExpansionPanelDetails
                className="expansion-details"
                style={{ display: "block" }}
              >
                {contributors.asking.map((asking, index) => {
                  var users = usersInfoList.filter(usersInfo => {
                    return usersInfo.id === asking;
                  });
                  var user = null;
                  if (users.length > 0) {
                    user = users[0];
                  }
                  return user !== null ? (
                    <ContributorCard
                      key={asking}
                      image={user.image}
                      name={user.name}
                      isAsking={true}
                      acceptContributor={this.acceptContributor.bind(
                        this,
                        asking
                      )}
                      removeContributor={this.toggleDeleteDialog.bind(
                        this,
                        "Rimuovi collaboratore",
                        "Sei sicuro di voler rimuovere questo collaboratore?",
                        "remove-contributor",
                        { id: asking, isAsking: true }
                      )}
                      owner={isOwner}
                    />
                  ) : (
                    ""
                  );
                })}
              </ExpansionPanelDetails>
            </ExpansionPanel>
          )}
          <ExpansionPanel className="expansion-panel" color="primary">
            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
              Calendario ({calendar.length})
            </ExpansionPanelSummary>
            <ExpansionPanelDetails
              className="expansion-details"
              style={{ display: "block" }}
            >
              {!readOnly && (
                <div style={{ margin: "0 auto", width: "fit-content" }}>
                  <Button onClick={this.toggleCalendarDialog.bind(this)}>
                    <Add /> Aggiungi partita a calendario
                  </Button>
                </div>
              )}
              {calendar.map((item, index) => 
                <CalendarCard key={item.key} date={item.date} onClickDate={this.onClickDate}/>)}
            </ExpansionPanelDetails>
          </ExpansionPanel>

          {team !== null && !isAsking && !isOwner && readOnly && (
            <Button
              className="ask-contribution"
              variant="contained"
              color="primary"
              onClick={this.askContribution.bind(this)}
            >
              Richiedi collaborazione
            </Button>
          )}

          {/* EditFormationDialog */}
          <EditFormationDialog
            open={editFormationOpen}
            formation={currentEditFormation}
            closeEditFormation={this.closeEditFormation.bind(this)}
            playersList={players}
            saveFormation={this.saveFormation}
            deleteFormation={this.deleteFormation}
            readOnly={readOnly}
          />
        </div>
        {/* Dialog edit */}
        <Dialog
          fullScreen
          open={editPlayerDialogOpen}
          onClose={this.onCloseEditPlayer.bind(this)}
          TransitionComponent={Transition}
        >
          <AppBar position="fixed" color="secondary">
            <Toolbar>
              <IconButton
                color="inherit"
                onClick={this.onCloseEditPlayer.bind(this)}
                aria-label="Close"
              >
                <Close />
              </IconButton>
              <Typography variant="h6" color="inherit" style={{ flex: 1 }}>
                {editingPlayer && editingPlayer.id !== ""
                  ? "Modifica "
                  : "Crea nuovo giocatore"}
                {editingPlayer ? editingPlayer.name : ""}
              </Typography>
              {!readOnly && editingPlayer && editingPlayer.id !== "" && (
                <IconButton
                  color="inherit"
                  onClick={this.toggleDeleteDialog.bind(
                    this,
                    "Elimina giocatore",
                    "Sei sicuro di voler eliminare questo giocatore?",
                    "delete"
                  )}
                  aria-label="Delete"
                >
                  <Delete />
                </IconButton>
              )}
            </Toolbar>
          </AppBar>
          <div style={{ padding: "30px" }}>
            <div className="number-edit-circle">
              <TextField
                placeholder="0"
                className="number-edit"
                type="number"
                disabled={!onEditPlayer}
                value={
                  editingPlayer
                    ? editingPlayer.onEdit
                      ? tempEditingPlayer.number
                      : editingPlayer.number
                    : ""
                }
                onChange={this.onChangePlayerInfo.bind(this, "number")}
              />
            </div>
            <div>Nome:</div>
            <TextField
              placeholder="Nome giocatore"
              disabled={!onEditPlayer}
              value={
                editingPlayer
                  ? editingPlayer.onEdit
                    ? tempEditingPlayer.name
                    : editingPlayer.name
                  : ""
              }
              onChange={this.onChangePlayerInfo.bind(this, "name")}
            />
            <div>Ruolo:</div>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={this.isRoleChecked("Palleggiatore")}
                    onChange={this.onChangeRole.bind(this, "Palleggiatore")}
                    value="Palleggiatore"
                    color="primary"
                    disabled={!onEditPlayer}
                  />
                }
                label="Palleggiatore"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={this.isRoleChecked("Centrale")}
                    onChange={this.onChangeRole.bind(this, "Centrale")}
                    value="Centrale"
                    color="primary"
                    disabled={!onEditPlayer}
                  />
                }
                label="Centrale"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={this.isRoleChecked("Banda")}
                    onChange={this.onChangeRole.bind(this, "Banda")}
                    value="Banda"
                    color="primary"
                    disabled={!onEditPlayer}
                  />
                }
                label="Banda"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={this.isRoleChecked("Opposto")}
                    onChange={this.onChangeRole.bind(this, "Opposto")}
                    value="Opposto"
                    color="primary"
                    disabled={!onEditPlayer}
                  />
                }
                label="Opposto"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={this.isRoleChecked("Libero")}
                    onChange={this.onChangeRole.bind(this, "Libero")}
                    value="Libero"
                    color="primary"
                    disabled={!onEditPlayer}
                  />
                }
                label="Libero"
              />
            </FormGroup>
            <div className="edit-save-container">
              {onEditPlayer && (
                <Button
                  variant={"outlined"}
                  color="primary"
                  onClick={this.cancel.bind(this)}
                  className="buttons"
                >
                  Annulla
                </Button>
              )}
              {!readOnly && (
                <Button
                  variant={"contained"}
                  color="primary"
                  onClick={
                    onEditPlayer
                      ? this.onSaveEditPlayer.bind(this)
                      : this.setOnEditPlayer.bind(this)
                  }
                  className="buttons"
                >
                  {onEditPlayer ? "Salva" : "Modifica"}
                </Button>
              )}
            </div>
          </div>
        </Dialog>
        <YesNoDialog
          open={deleteDialogOpen}
          noAction={this.toggleDeleteDialog.bind(this, "", "", "", null)}
          yesAction={this.dialogYesAction}
          dialogText={deleteDialogText}
          dialogTitle={deleteDialogTitle}
        />
        <AddCalendarDialog
        open={openCalendarDialog}
        onClose={this.toggleCalendarDialog}
        teamName={team ? team.name : ''}
        addOnCalendar={this.addGameOnCalendar}
        />
      </div>
    );
  }
}

export default withStyles(styles, { withTheme: true })(EditTeam);
