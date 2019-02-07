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
  Chip
} from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import { Close, Add } from "@material-ui/icons";
import "./EditFormationDialog.scss";

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
    editingPosition: -1
  };

  componentWillReceiveProps(nextProps) {
    this.setState({
      ...this.state,
      formation: nextProps.formation,
      open: nextProps.open,
      playersList: nextProps.playersList
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

  render() {
    var courtPositions = [];
    var index = 0;
    while (courtPositions.length < 6) {
      var emptyPlayer = {
        id: "",
        position: index + 1,
        name: "",
        number: ""
      };
      if (
        this.state.formation !== null &&
        this.state.formation.players !== null &&
        this.state.formation.players.length > index
      ) {
        var player = this.getPlayerFromList(
          this.state.formation.players[index]
        );
        if (player !== null) {
          player.position = this.state.formation.players[index].position;
          courtPositions.push(player);
        } else {
          courtPositions.push(emptyPlayer);
        }
      } else {
        courtPositions.push(emptyPlayer);
      }
      index++;
    }
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
            <Button color="inherit" onClick={this.props.closeEditFormation}>
              Salva
            </Button>
          </Toolbar>
        </AppBar>

        <div className="edit-formation-dialog">
          <div className="court">
            {courtPositions.map((player, index) => {
              return (
                <div
                  key={index}
                  className={"position position-" + player.position}
                >
                  {player.number !== "" ? (
                    <Button variant="outlined" style={{ display: "block" }}>
                      <Avatar className="avatar">{player.number}</Avatar>
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
          <div>
            {this.state.playersList.map((player, index) => {
              return (
                <Chip
                  className="chip"
                  key={player.id}
                  label={player.name}
                  avatar={<Avatar>{player.number}</Avatar>}
                />
              );
            })}
          </div>
        </div>
      </Dialog>
    );
  }
}

export default EditFormationDialog;
