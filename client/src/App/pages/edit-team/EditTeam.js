import React from "react";
import {
  ArrowBack,
  PersonAdd,
  Close,
  GifOutlined,
  Delete
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
  FormGroup
} from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import store from "../../store/store";
import { updateAppbar, updateCreateMatch, showMessageAction } from "../../actions/actions";
import firebase from "firebase/app";
import "firebase/database";
import { firebaseConfig, newGuid } from "../../App";
import ls from "local-storage";
import "./EditTeam.scss";
import YesNoDialog from "../../components/yesNoDialog/YesNoDialog";

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
    deleteDialogOpen: false
  };
  teamRef = null;

  componentDidMount() {
    store.dispatch(updateCreateMatch("save", false));
    store.dispatch(updateAppbar("visible", false));
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }

    this.db = firebase.app().database();

    this.teamRef = this.db.ref(
      "users/" + ls.get("user").id + "/teams/" + this.props.match.params.id
    );
    var self = this;
    this.teamRef.on("value", snapshot => {
      console.log("team", snapshot.val());
      self.setState({ ...self.state, team: snapshot.val() });
      self.teamRef.off("value");
    });
  }

  componentWillUnmount() {
    if (this.teamRef !== null) {
      this.teamRef.off("value");
    }
  }

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
    if(this.isValid()){
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
      if(this.state.editingPlayer.id === ""){
        isNew = true;
      }
      if(isNew){
        tempPlayers.push({
          name: this.state.tempEditingPlayer.name,
          number: this.state.tempEditingPlayer.number,
          id: newGuid(),
          roles: this.state.tempEditingPlayer.roles
        })
      }
      var tempTeam = JSON.parse(JSON.stringify(this.state.team));
      tempTeam.players = tempPlayers;
      var newEditPlayer = JSON.parse(JSON.stringify(this.state.tempEditingPlayer));
      newEditPlayer.onEdit = false;
      this.setState(oldState => ({
        ...oldState,
        team: tempTeam,
        editingPlayer: newEditPlayer
      }));
        this.teamRef.set(tempTeam);
      if(isNew){
        this.onCloseEditPlayer();
      }
      store.dispatch(
        showMessageAction("success", "Salvato")
      );
    }else{      
      store.dispatch(
        showMessageAction("error", "Dati mancanti!")
      );
    }
    
  };

  isValid = () =>{
    return this.state.tempEditingPlayer.name.trim() !== "" && this.state.tempEditingPlayer.number !== "";
  }

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

    this.setState({
      ...this.state,
      team: { ...this.state.team, players: tempPlayers },
      editPlayerDialogOpen: false,
      deleteDialogOpen: false
    });
    this.teamRef.set(this.state.team);
       
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

  toggleDeleteDialog = () => {
    this.setState({
      ...this.state,
      deleteDialogOpen: !this.state.deleteDialogOpen
    });
  };

  cancel = () =>{
    if(this.state.editingPlayer.id === ""){
      this.onCloseEditPlayer();
    }else{
      this.setOnEditPlayer();
    }
  }

  render() {
    const { classes, theme } = this.props;
    var players =
      this.state !== null &&
      this.state.team !== null &&
      this.state.team.players !== null
        ? this.state.team.players
        : [];
    players.sort(function(a, b) {
      return parseInt(a.number) - parseInt(b.number);
    });
    var onEditPlayer = this.state.editingPlayer
      ? this.state.editingPlayer.onEdit
      : false;
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
              {this.state.team ? this.state.team.name : ""}
            </Typography>
            {/* <IconButton
            color="inherit"
            aria-label="Menu"
            onClick={this.handleClickMenu.bind(this)}
          >
            <MoreVertIcon />
          </IconButton>
          <Menu
            id="long-menu"
            anchorEl={anchorEl}
            open={openMenu}
            onClose={this.handleCloseMenu}
            style={{ marginTop: "40px" }}
          >
            {!this.state.spectator && (
              <MenuItem
                key={"deleteGame"}
                onClick={this.deleteGame.bind(this)}
              >
                <Delete />
                Elimina
              </MenuItem>
            )}

            <MenuItem key={"shareGame"} onClick={this.share.bind(this)}>
              <Share />
              Condividi
            </MenuItem>
          </Menu> */}
          </Toolbar>
        </AppBar>
        <div className="team-info">
          <ExpansionPanel className="expansion-panel">
            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
              Giocatori ({players.length})
            </ExpansionPanelSummary>
            <ExpansionPanelDetails
              className="expansion-details"
              style={{ display: "block" }}
            >
              <div style={{ margin: "0 auto", width: "fit-content" }}>
                <Button onClick={this.addPlayer.bind(this, null)}>
                  <PersonAdd /> Aggiungi giocatore
                </Button>
              </div>

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
        </div>
        {/* Dialog edit */}
        <Dialog
          fullScreen
          open={this.state.editPlayerDialogOpen}
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
                {this.state.editingPlayer && this.state.editingPlayer.id !== "" ? "Modifica " : "Crea nuovo giocatore"}
                {this.state.editingPlayer ? this.state.editingPlayer.name : ""}
              </Typography>
              {this.state.editingPlayer && this.state.editingPlayer.id !== "" && (
                <IconButton
                  color="inherit"
                  onClick={this.toggleDeleteDialog.bind(this)}
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
                  this.state.editingPlayer
                    ? this.state.editingPlayer.onEdit
                      ? this.state.tempEditingPlayer.number
                      : this.state.editingPlayer.number
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
                this.state.editingPlayer
                  ? this.state.editingPlayer.onEdit
                    ? this.state.tempEditingPlayer.name
                    : this.state.editingPlayer.name
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
            </div>
          </div>
        </Dialog>
        <YesNoDialog
          open={this.state.deleteDialogOpen}
          noAction={this.toggleDeleteDialog}
          yesAction={this.deletePlayer}
          dialogText={"Sei sicuro di voler eliminare questo giocatore?"}
        />
      </div>
    );
  }
}

export default withStyles(styles, { withTheme: true })(EditTeam);
