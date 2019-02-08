import React from "react";
import { Button, Avatar, Badge, Fab, Chip } from "@material-ui/core";
import { Close, Add, Done } from "@material-ui/icons";
import "./CourtAndChip.scss";

class CourtAndChip extends React.Component {


  getCourtPositions = formation => {
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
      if (formation !== null && formation.players !== null) {
        formation.players.forEach(player => {
          if (value.position === player.position) {
            var playerInfo = self.getPlayerFromList(player);
            if (playerInfo) {
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

  getPlayerFromList = player => {
    var found = null;
    for (var i = 0; i < this.props.playersList.length; i++) {
      if (this.props.playersList[i].id === player.id) {
        found = this.props.playersList[i];
      }
    }
    return found;
  };

  getFilteredPlayersList = () => {
    var playersList = [];
    if (this.props.formation) {
      this.props.playersList.forEach(value => {
        var found = false;
        this.props.formation.players.forEach(fp => {
          if (fp.id === value.id) {
            found = true;
          }
        });
        if (!found) {
          playersList.push(value);
        }
      });
    } else {
      playersList = this.props.playersList;
    }
    return playersList;
  };

  render() {
    var courtPositions = this.getCourtPositions(this.props.formation);

    var filteredPlayersList = this.getFilteredPlayersList();
    return (
      <div>
        <div className="court">
          {courtPositions.map((player, index) => {
            return (
              <div
                key={index}
                className={"position position-" + player.position}
              >
                {player.number !== "" && !this.props.readOnly ? (
                  <Button
                    variant="outlined"
                    style={{ display: "block", padding: 0 }}
                    onClick={this.props.removeFromCourt.bind(this, player)}
                  >
                    <Avatar className="avatar">
                      <Badge badgeContent={"-"} className="badge">
                        {player.number}
                      </Badge>
                    </Avatar>
                    <div>{player.name}</div>
                  </Button>
                ) : (this.props.editingPosition >= 0 || this.props.readOnly) &&
                  this.props.editingPosition !== player.position ? (
                  <div>
                    <Avatar className="avatar">{player.number}</Avatar>
                    <div>{player.name}</div>
                  </div>
                ) : (
                  <Fab
                    size="small"
                    color="primary"
                    aria-label="Add"
                    onClick={this.props.addPlayer.bind(this, player)}
                  >
                    {this.props.editingPosition >= 0 &&
                    this.props.editingPosition === player.position ? (
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
        <div style={{ marginTop: "15px" }}>
          {filteredPlayersList.map((player, index) => {
            var chipEdit = (
              <Chip
                className="chip"
                key={player.id}
                label={player.name}
                avatar={<Avatar>{player.number}</Avatar>}
                deleteIcon={<Done />}
                onDelete={this.props.choosePlayer.bind(this, player)}
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
            return this.props.editingPosition !== -1 ? chipEdit : chip;
          })}
        </div>
      </div>
    );
  }
}
export default CourtAndChip;
