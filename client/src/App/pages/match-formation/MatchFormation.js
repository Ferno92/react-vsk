import React from "react";
import firebase from "firebase/app";
import "firebase/database";
import ls from "local-storage";
import { firebaseConfig } from "../../App";
import TeamCard from "../../components/team-card/TeamCard";
import { Avatar, Chip, Button } from "@material-ui/core";
import { Close } from "@material-ui/icons";
import FormationCard from "../../components/formation-card/FormationCard";
import "./MatchFormation.scss";
import CourtAndChip from "../../components/court-and-chip/CourtAndChip";
import { teamService } from "../../App";

class MatchFormation extends React.Component {
  state = {
    team: null,
    teamsList: [],
    formation: null,
    configured: false,
    isOwnerMe: false,
    readOnly: true,
    editingPosition: -1,
    live: true,
    history: []
  };
  teamsRef = null;

  componentDidMount() {
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }

    this.db = firebase.app().database();

    var user = ls.get("user");
    var userId = "";
    var isOwnerMe = false;
    if (
      user !== null &&
      (this.props.owner === undefined || this.props.owner === user.id)
    ) {
      userId = user.id;
      isOwnerMe = true;
    } else {
      userId = this.props.owner;
    }
    var self = this;

    teamService.getAllTeams(teams => {
      self.setState({
        teamsList: teams,
        isOwnerMe: isOwnerMe
      });
    }, userId);

    // this.teamsRef = this.db.ref("users/" + userId + "/teams");
    // this.teamsRef.on("value", );
  }

  componentWillUnmount() {
    if (this.teamsRef !== null) {
      this.teamsRef.off("value");
    }
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.currentGame &&
      (this.state.team === null || !this.state.configured)
    ) {
      this.setState({
        team:
          nextProps.currentGame.team === undefined
            ? null
            : nextProps.currentGame.team,
        configured:
          nextProps.currentGame.team !== null &&
          nextProps.currentGame.team !== undefined,
        formation:
          nextProps.currentGame.formation === undefined
            ? null
            : nextProps.currentGame.formation,
        readOnly: this.state.readOnly
          ? true
          : nextProps.tab !== 1
          ? true
          : this.state.readOnly,
        live: nextProps.currentGame.live,
        history: nextProps.currentGame.sets
      });
    } else if (nextProps.currentGame.formation) {
      this.setState({
        formation: nextProps.currentGame.formation,
        readOnly: this.state.readOnly
          ? true
          : nextProps.tab !== 1
          ? true
          : this.state.readOnly
      });
    }
  }

  onClickTeam = teamId => {
    var team = null;
    this.state.teamsList.forEach(t => {
      if (t.id === teamId) {
        team = t;
      }
    });
    this.setState({ ...this.state, team: team });
  };

  removeTeam = () => {
    this.setState({ ...this.state, team: null, formation: null });
  };

  chooseFormation = formation => {
    this.setState({ ...this.state, formation: formation });
  };

  removeFormation = () => {
    this.setState({ ...this.state, formation: null });
  };

  startTracking = () => {
    var game = this.props.currentGame;
    game.team = this.state.team.id;
    game.formation = this.state.formation;
    this.props.gameRef.set(game);
    this.setState({
      ...this.state,
      team: this.state.team.id
    });
  };

  rotateFormation = () => {
    var tempPlayers = this.state.formation.players.slice();
    var self = this;
    tempPlayers.forEach(player => {
      player.position = self.getNewPosition(player.position);
    });
    //  this.setState({...this.state, formation: {...this.state.formation, players: tempPlayers}});

    var game = this.props.currentGame;
    game.formation.players = tempPlayers;
    this.props.gameRef.set(game);
  };

  getNewPosition = oldPos => {
    return oldPos - 1 < 1 ? 6 : oldPos - 1;
  };

  switchPlayer = () => {
    this.setState({ ...this.state, readOnly: !this.state.readOnly });
  };

  addPlayer = player => {
    this.setState({
      ...this.state,
      editingPosition: this.state.editingPosition >= 0 ? -1 : player.position
    });
  };

  removeFromCourt = player => {
    var formationPlayers = this.state.formation.players.slice();
    var index = -1;
    formationPlayers.forEach((p, i) => {
      if (p.id === player.id) {
        index = i;
      }
    });
    formationPlayers.splice(index, 1);
    var game = this.props.currentGame;
    game.formation.players = formationPlayers;
    this.props.gameRef.set(game);
  };

  choosePlayerCallback = (players, editingPosition) => {
    var self = this;
    this.setState(
      {
        ...this.state,
        editingPosition: editingPosition
      },
      () => {
        var game = self.props.currentGame;
        game.formation.players = players;
        self.props.gameRef.set(game);
      }
    );
  };

  getBestFormation = () => {
    const { history } = this.state;

    var formationArray = [];
    history.forEach((set, index) => {
      if(set.history){
        set.history.forEach((item, i) => {
          var historyIndex = this.getHistoryIndex(formationArray, item);
          if (item.a === "x") {
            if (formationArray.length === 0 || historyIndex < 0) {
              formationArray.push({
                formation: item.formation,
                count: 1
              });
            } else {
              formationArray[historyIndex].count++;
            }
          }
        });
      }
    });
    formationArray.sort(this.sortAscCount);

    return formationArray;
  };

  getBestFormationPlayers = formation => {
    var players = [];
    const { teamsList } = this.state;
    if (formation.formation && formation.formation.length > 0 && teamsList.length > 0) {
      formation.formation.forEach((item, index) => {
        teamsList[0].players.forEach((player, i) => {
          if (player.id === item) {
            player.position = index + 1;
            players.push(player);
          }
        });
      });
    }
    return players;
  };

  sortAscCount = (a, b) => {
    if (a.count < b.count) return -1;
    if (a.count > b.count) return 1;
    return 0;
  };

  getHistoryIndex = (array, item) => {
    var index = -1;
    array.forEach((formationList, i) => {
      var samePlayers = 0;

      if (formationList.formation) {
        formationList.formation.forEach((player, j) => {
          if (item.formation.length - 1 >= j) {
            if (item.formation[j] === player) {
              samePlayers++;
            }
          }
        });
      }
      if (samePlayers === 6) {
        index = i;
      }
    });
    return index;
  };

  render() {
    var currentTeam = null;
    const { live } = this.state;
    if (this.state.configured) {
      var self = this;
      this.state.teamsList.forEach(team => {
        if (team.id === self.state.team) {
          currentTeam = team;
        }
      });
    }
    var bestFormation = [];
    var bestPlayers = [];
    if (!live) {
      bestFormation =
        this.getBestFormation().length > 0 ? this.getBestFormation() : [];
      if (bestFormation.length > 0) {
        bestPlayers = this.getBestFormationPlayers(
          bestFormation[bestFormation.length - 1]
        );
      }
    }

    return (
      <div className="match-formation">
        {!this.state.configured && (
          <div>
          {live ? (
            <React.Fragment>
            {this.state.team === null && (
              <div className="team-not-configured">
                <div>Quale squadra vuoi seguire?</div>
                {this.state.teamsList.map((team, index) => {
                  return (
                    <TeamCard
                      key={team.id}
                      team={team}
                      opening={false}
                      onClick={this.onClickTeam.bind(this, team.id)}
                      index={index}
                    />
                  );
                })}
              </div>
            )}

            {this.state.team !== null && (
              <div className="formation-not-configured">
                <div className="creation-info">
                  Squadra:
                  <Chip
                    className="chip"
                    key={this.state.team.id}
                    label={this.state.team.name}
                    avatar={<Avatar src={this.state.team.pictureUrl} />}
                    deleteIcon={<Close />}
                    onDelete={this.removeTeam.bind(this)}
                  />
                </div>
                {this.state.formation !== null && (
                  <div className="creation-info">
                    Formazione:
                    <Chip
                      className="chip"
                      key={this.state.formation.id}
                      label={this.state.formation.name}
                      avatar={
                        <Avatar>
                          {this.state.formation.name.charAt(0).toUpperCase()}
                        </Avatar>
                      }
                      deleteIcon={<Close />}
                      onDelete={this.removeFormation.bind(this)}
                    />
                  </div>
                )}
                {this.state.formation === null && (
                  <div>
                    <div>Con quale formazione vuoi partire?</div>

                    {this.state.team.formations.map((formation, index) => {
                      return (
                        <FormationCard
                          formation={formation}
                          addFormation={this.chooseFormation}
                          key={index}
                          players={this.state.team.players}
                        />
                      );
                    })}

                    <FormationCard
                      formation={{
                        id: "",
                        name: "Formazione vuota",
                        players: []
                      }}
                      addFormation={this.chooseFormation}
                      key={"empty"}
                      players={this.state.team.players}
                    />
                  </div>
                )}

                {this.state.formation !== null && (
                  <Button
                    style={{ display: "block", margin: "30px auto" }}
                    variant="outlined"
                    onClick={this.startTracking.bind(this)}
                  >
                    Start
                  </Button>
                )}
              </div>
            )}
            </React.Fragment>
        ) : (<div>Non è stata configurata nessuna formazione durante la partita</div>)}
          </div>
        )}
        {this.state.configured && currentTeam !== null && (
          <React.Fragment>
            {live ? (
              <React.Fragment>
                {this.state.isOwnerMe && (
                  <div className="edit-buttons">
                    <Button
                      variant="outlined"
                      onClick={this.rotateFormation.bind(this)}
                      color="primary"
                    >
                      Ruota formazione
                    </Button>

                    <Button
                      variant={this.state.readOnly ? "outlined" : "contained"}
                      onClick={this.switchPlayer.bind(this)}
                      color="primary"
                    >
                      {this.state.readOnly
                        ? "Sostituisci giocatore"
                        : "Fine modifiche"}
                    </Button>
                  </div>
                )}

                <CourtAndChip
                  editingPosition={this.state.editingPosition}
                  removeFromCourt={this.removeFromCourt}
                  addPlayer={this.addPlayer}
                  formation={this.state.formation}
                  playersList={currentTeam.players}
                  readOnly={this.state.readOnly}
                  choosePlayerCallback={this.choosePlayerCallback}
                />
              </React.Fragment>
            ) : (
              <React.Fragment>
                <div>
                  Formazione più efficace (
                  {bestFormation.length > 0
                    ? bestFormation[bestFormation.length - 1].count
                    : ""}{" "}
                  punti)
                </div>
                <FormationCard
                  formation={{ players: bestPlayers }}
                  addFormation={() => {}}
                  key={"best"}
                  players={bestPlayers}
                />
              </React.Fragment>
            )}
          </React.Fragment>
        )}
      </div>
    );
  }
}

export default MatchFormation;
