import React from "react";
import firebase from "firebase/app";
import "firebase/database";
import ls from "local-storage";
import { firebaseConfig } from "../../App";
import TeamCard from "../../components/team-card/TeamCard";
import { Avatar, Chip, Button } from "@material-ui/core";
import { Delete, Close } from "@material-ui/icons";
import store from "../../store/store";
import { updateAppbar, updateCreateMatch } from "../../actions/actions";
import FormationCard from "../../components/formation-card/FormationCard";
import "./MatchFormation.scss";
import CourtAndChip from "../../components/court-and-chip/CourtAndChip";

class MatchFormation extends React.Component {
  state = {
    team: null,
    teamsList: [],
    formation: null,
    configured: false
  };
  teamsRef = null;

  componentDidMount() {
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }

    this.db = firebase.app().database();

    var user = ls.get("user");
    var userId = "";
    if (
      user !== null &&
      (this.props.owner === undefined ||
        this.props.owner === user.id)
    ) {
      userId = user.id;
    } else {
      userId = this.props.owner;
    }
    this.teamsRef = this.db.ref("users/" + userId + "/teams");
    var self = this;
    this.teamsRef.on("value", snapshot => {
      console.log("teams", snapshot.val());
      var data_list = [];
      for (var property in snapshot.val()) {
        if (snapshot.val().hasOwnProperty(property)) {
          var team = snapshot.val()[property];
          team.key = property;
          data_list.push(team);
        }
      }
      self.setState({ ...self.state, teamsList: data_list });
    });
  }

  componentWillUnmount() {
    if (this.teamsRef !== null) {
      this.teamsRef.off("value");
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.currentGame && this.state.team === null) {
      this.setState({
        team:
          nextProps.currentGame.team === undefined
            ? null
            : nextProps.currentGame.team,
        configured: nextProps.currentGame.team !== null && nextProps.currentGame.team !== undefined,
        formation:
          nextProps.currentGame.formation === undefined
            ? null
            : nextProps.currentGame.formation
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
    this.setState({ ...this.state, configured: true, team: this.state.team.id });
  };

  rotateFormation = () =>{
      var tempPlayers = this.state.formation.players.slice();
      var self = this;
      tempPlayers.forEach((player) =>{
        player.position = self.getNewPosition(player.position);
      });
      this.setState({...this.state, formation: {...this.state.formation, players: tempPlayers}});
  }

  getNewPosition = (oldPos) =>{
    return oldPos - 1 < 1 ? 6 : oldPos - 1;
  }

  render() {
    var currentTeam = null;
    if (this.state.configured) {
      var self = this;
      this.state.teamsList.forEach(team => {
        if (team.id === self.state.team) {
            currentTeam = team;
        }
      });
    }

    return (
      <div className="match-formation">
        {!this.state.configured && (
          <div>
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
          </div>
        )}
        {this.state.configured && currentTeam !== null && (
          <div>
              <Button variant="outlined" onClick={this.rotateFormation.bind(this)}>Rotate</Button>
            <CourtAndChip
              editingPosition={-1}
              removeFromCourt={function(){}}
              addPlayer={function(){}}
              formation={this.state.formation}
              playersList={currentTeam.players}
              readOnly={true}
              choosePlayerCallback={function(){}}
            />
          </div>
        )}
      </div>
    );
  }
}

export default MatchFormation;
