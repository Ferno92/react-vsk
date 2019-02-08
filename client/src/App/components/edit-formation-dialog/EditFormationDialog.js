import React from "react";
import {
  Dialog,
  Slide,
  AppBar,
  Toolbar,
  IconButton,
  Button,
  Avatar,
  Fab,
  Chip,
  Badge,
  TextField,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import { Close, Add, Done } from "@material-ui/icons";
import "./EditFormationDialog.scss";
import {newGuid} from "../../App"

function Transition(props) {
  return <Slide direction="up" {...props} />;
}

const styles = {
  appBar: {
    position: "relative"
  },
  flex: {
    flex: 1
  }
};

class EditFormationDialog extends React.Component {
  state = {
    open: false,
    formation: null,
    playersList: [],
    editingPosition: -1,
    isNew: false,
    askDelete: false
  };

  componentWillReceiveProps(nextProps) {
    var playersList = nextProps.playersList;
    var formation = nextProps.formation;
    if(nextProps.formation){
      formation.id = formation.id ? formation.id : newGuid();
    }else{
      formation = {
        players: [],
        id: newGuid(),
        name: ""
      }
    }

    this.setState({
      ...this.state,
      formation: formation,
      open: nextProps.open,
      playersList: playersList,
      isNew: nextProps.formation === null
    });
  }

  getPlayerFromList = player => {
    var found = null;
    for (var i = 0; i < this.state.playersList.length; i++) {
      if (this.state.playersList[i].id === player.id) {
        found = this.state.playersList[i];
      }
    }
    return found;
  };

  addPlayer = player => {
    this.setState({
      ...this.state,
      editingPosition: this.state.editingPosition >= 0 ? -1 : player.position
    });
  };

  choosePlayer = player => {
    console.log("choosePlayer", player);
    var courtPos = this.getCourtPositions();
    courtPos[this.state.editingPosition - 1] = {
      id: player.id,
      position: this.state.editingPosition
    };
    var temp = [];
    courtPos.forEach(pos => {
      if (pos.id !== "") {
        temp.push(pos);
      }
    });
    this.setState({
      ...this.state,
      formation: { ...this.state.formation, players: temp },
      editingPosition: -1
    });
  };

  getFilteredPlayersList = () => {
    var playersList = [];
    if (this.state.formation) {
      this.state.playersList.forEach(value => {
        var found = false;
        this.state.formation.players.forEach(fp => {
          if (fp.id === value.id) {
            found = true;
          }
        });
        if (!found) {
          playersList.push(value);
        }
      });
    } else {
      playersList = this.state.playersList;
    }
    return playersList;
  };

  getCourtPositions = () => {
    var courtPositions = [];
    var index = 0;
    while (courtPositions.length < 6) {
      var emptyPlayer = {
        id: "",
        position: index + 1,
        name: "",
        number: ""
      };
      courtPositions.push(emptyPlayer);
      index++;
    }
    var self = this;
    courtPositions.forEach((value, cIndex) => {
      if (
        self.state.formation !== null &&
        self.state.formation.players !== null
      ) {
        self.state.formation.players.forEach(player => {
          if (value.position === player.position) {
            var playerInfo = self.getPlayerFromList(player);
            if(playerInfo){
              playerInfo.position = player.position;
              courtPositions[cIndex] = playerInfo;
            }
          }
        });
      }
    });

    courtPositions.sort(function(a, b) {
      return parseInt(a.position) - parseInt(b.position);
    });

    return courtPositions;
  };

  removeFromCourt = (player) => {
    var formationPlayers = this.state.formation.players.slice();
    console.log(formationPlayers.indexOf(player));
    var index = -1;
    formationPlayers.forEach((p, i) => {
      if(p.id === player.id){
        index = i;
      }
    })
    formationPlayers.splice(index, 1);
    this.setState({...this.state, formation: {...this.state.formation, players: formationPlayers}});
  }

  onChangeName = (evt) => {
    this.setState({...this.state, formation: {...this.state.formation, name: evt.target.value}});
  }

  askDeleteFormation = () =>{
    this.setState({...this.state, askDelete: !this.state.askDelete})
  }

  deleteFormation = () =>{
    this.props.deleteFormation(this.state.formation);
    this.setState({...this.state, askDelete: false})
  }

  render() {
    var courtPositions = this.getCourtPositions();

    var filteredPlayersList = this.getFilteredPlayersList();
    return (
      <Dialog
        fullScreen
        open={this.state.open}
        onClose={this.props.closeEditFormation}
        TransitionComponent={Transition}
      >
        <AppBar
          style={{
            position: "relative"
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              onClick={this.props.closeEditFormation}
              aria-label="Close"
            >
              <Close />
            </IconButton>
            <Typography
              variant="h6"
              color="inherit"
              style={{
                flex: 1
              }}
            >
              Modifica formazione
            </Typography>
            <Button color="inherit" onClick={this.props.saveFormation.bind(this, this.state.formation)}>
              Salva
            </Button>
          </Toolbar>
        </AppBar>

        <div className="edit-formation-dialog">
        <TextField
          label="Nome formazione"
          margin="normal"
          variant="outlined"
          className="name inputs"
          value={
            this.state.formation ? this.state.formation.name : ""
          }
          onChange={this.onChangeName.bind(this)}
        />
          <div className="court">
            {courtPositions.map((player, index) => {
              return (
                <div
                  key={index}
                  className={"position position-" + player.position}
                >
                  {player.number !== "" ? (
                    <Button
                      variant="outlined"
                      style={{ display: "block", padding: 0 }}
                      onClick={this.removeFromCourt.bind(this, player)}
                    >
                      <Avatar className="avatar">
                        <Badge badgeContent={"-"} className="badge">
                          {player.number}
                        </Badge>
                      </Avatar>
                      <div>{player.name}</div>
                    </Button>
                  ) : this.state.editingPosition >= 0 &&
                    this.state.editingPosition !== player.position ? (
                    <div>
                      <Avatar className="avatar">{player.number}</Avatar>
                      <div>{player.name}</div>
                    </div>
                  ) : (
                    <Fab
                      size="small"
                      color="primary"
                      aria-label="Add"
                      onClick={this.addPlayer.bind(this, player)}
                    >
                      {this.state.editingPosition >= 0 &&
                      this.state.editingPosition === player.position ? (
                        <Close />
                      ) : (
                        <Add />
                      )}
                    </Fab>
                  )}
                </div>
              );
            })}
          </div>
          <div style={{marginTop: "15px"}}>
            {filteredPlayersList.map((player, index) => {
              var chipEdit = (
                <Chip
                  className="chip"
                  key={player.id}
                  label={player.name}
                  avatar={<Avatar>{player.number}</Avatar>}
                  deleteIcon={<Done />}
                  onDelete={this.choosePlayer.bind(this, player)}
                />
              );
              var chip = (
                <Chip
                  className="chip"
                  key={player.id}
                  label={player.name}
                  avatar={<Avatar>{player.number}</Avatar>}
                />
              );
              return this.state.editingPosition !== -1 ? chipEdit : chip;
            })}
          </div>
          {!this.state.isNew && (<Button className="delete" onClick={this.askDeleteFormation}>Elimina formazione</Button>)}
          
        </div>
        <Dialog
          open={this.state.askDelete}
          onClose={this.askDeleteFormation.bind(this)}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">{"Elimina partita"}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Sei sicuro di voler eliminare la formazione?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={this.askDeleteFormation.bind(this)}
              color="primary"
            >
              No
            </Button>
            <Button
              onClick={this.deleteFormation.bind(this)}
              color="primary"
              autoFocus
            >
              Si
            </Button>
          </DialogActions>
        </Dialog>
      </Dialog>
    );
  }
}

export default EditFormationDialog;
