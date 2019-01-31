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
  state = {
    teams: []
  };

  componentDidMount() {
    store.dispatch(updateAppbar("fabVisible", false));
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
  }

  componentWillUnmount() {
    if (this.teamsRef) {
      this.teamsRef.off("value");
    }
  }

  onClickTeam = (id) =>{
    this.props.history.push("/team/" + id);
  }

  render() {
    return (
      <div className="my-teams">
        {this.state !== null &&
          this.state.teams.map((team, index) => {
            return <TeamCard key={team.id} team={team} opening={false} onClick={this.onClickTeam.bind(this, team.id)} index={index}/>;
          })}
      </div>
    );
  }
}

export default MyTeams;
