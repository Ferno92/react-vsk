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

class MatchFormation extends React.Component {
  state = {
    team: null,
    teamsList: [],
    formation: null,
    gameRef: null,
    configured: false
  };
  teamsRef = null;

  constructor() {
    super();

  }

  componentDidMount() {
      
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }

    this.db = firebase.app().database();

    this.teamsRef = this.db.ref("users/" + ls.get("user").id + "/teams");
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

  componentWillReceiveProps(nextProps){
      
    if (nextProps.currentGame && this.state.team === null) {
      this.setState({
        team:
        nextProps.currentGame.team === undefined ? null : nextProps.currentGame.team,
        configured: nextProps.currentGame.team !== null,
        formation:
        nextProps.currentGame.formation === undefined ? null : nextProps.currentGame.formation,
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
    game.formation = this.state.formation.id;
    this.props.gameRef.set(game);
    this.setState({ ...this.state, configured: true });
  };

  render() {
    var currentFormation = null;
    if(this.state.configured){
        var self = this;
        this.state.teamsList.forEach((team) => {
            if(team.id === self.state.team){
                team.formations.forEach((formation) => {
                    if(formation.id === self.state.formation){
                        currentFormation = formation;
                        console.log(currentFormation);
                    }
                })
            }
        })
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
        {this.state.configured && (
          <div className="configured">Configurato correttamente</div>

        )}
      </div>
    );
  }
}

export default MatchFormation;
