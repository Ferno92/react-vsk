import React from "react";
import firebase from "firebase/app";
import "firebase/database";
import ls from "local-storage";
import { firebaseConfig } from "../../App";
import TeamCard from "../../components/team-card/TeamCard";
import "./MyTeams.scss";
import store from "../../store/store";
import { updateAppbar } from "../../actions/actions";

class MyTeams extends React.Component {
  db = null;
  teamsRef = null;
  usersRef = null;
  state = {
    teams: [],
    allTeams: [],
    search: false,
    text: ""
  };
  storeUnsubscribe = null;  

  componentDidMount() {
    if (ls.get("user") === null) {
      this.props.history.push("/");
    } else {
      store.dispatch(updateAppbar("fabVisible", true));
      if (!store.getState().appBar.visible) {
        store.dispatch(updateAppbar("visible", true));
      }
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
        self.setState({ ...self.state, teams: data_list });
      });
      this.usersRef = this.db.ref("/users");
      this.usersRef.on("value", snapshot => {
        var allTeams = [];
        for (var item in snapshot.val()) {
          var user = snapshot.val()[item];
          for (var team in user.teams) {
            var teamInfo = user.teams[team];
            teamInfo.owner = {
              displayName: user.displayName,
              pictureUrl: user.pictureUrl,
              id: item
            };
            allTeams.push(teamInfo);
          }
        }

        self.setState({ ...self.state, allTeams: allTeams });
      });
    }
    
    this.storeUnsubscribe = store.subscribe(this.updateProps);
  }

  componentWillUnmount() {
    if (this.teamsRef) {
      this.teamsRef.off("value");
    }
    if (this.usersRef) {
      this.usersRef.off("value");
    }
    
    if (this.storeUnsubscribe !== null) {
      this.storeUnsubscribe();
    }
  }

  updateProps = () => {
    console.log("MyTeams update props", store.getState().appBar);
    if(store.getState().appBar.search !== this.state.search || store.getState().appBar.inputSearch !== this.state.text){
      this.setState({...this.state, search: store.getState().appBar.search, text: store.getState().appBar.inputSearch});
    }
  }

  onClickTeam = (id, ownerId) => {
    this.props.history.push("/team/" + id + (ownerId !== null ? ("/" + ownerId) : ""));
  };

  render() {
    var teams = [];
    var otherTeams = [];
    if (this.state !== null) {
      if (this.state.search) {
        if (this.state.text.trim().length > 0) {
          this.state.allTeams.forEach((team, index) => {
            if (team.name.toLowerCase().indexOf(this.state.text.toLowerCase()) >= 0) {
              if(team.owner.id === ls.get("user").id){
                teams.push(team);
              }else{
                otherTeams.push(team);
              }
            }
          });
        }
      } else {
        this.state.teams.forEach((team, index) => {
          teams.push(team);
        });
      }
    }
    //TODO: nessun risultato
    return (
      <div className="my-teams">
      {this.state.search && (<h1>Cerca: {this.state.text}</h1>)}
      {!this.state.search && (<h1 style={{ textAlign: "center" }}>Le mie squadre:</h1>)}
      {this.state.search && teams.length > 0 && (<div className="titles">Le mie squadre:</div>)}
        {teams.length > 0 && teams.map((team, index) => {
            return (
              <TeamCard
                key={team.id}
                team={team}
                opening={false}
                onClick={this.onClickTeam.bind(this, team.id, null)}
                index={index}
              />
            );
          })}
          
      {this.state.search && otherTeams.length > 0 && (<div className="titles">Altre squadre:</div>)}
        {otherTeams.length > 0 && otherTeams.map((team, index) => {
            return (
              <TeamCard
                key={team.id}
                team={team}
                opening={false}
                onClick={this.onClickTeam.bind(this, team.id, team.owner.id)}
                index={index}
              />
            );
          })}
      </div>
    );
  }
}

export default MyTeams;
