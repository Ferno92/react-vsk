import firebase from "firebase/app";
import "firebase/database";
import { firebaseConfig } from "../App";

class TeamService {
  usersRef = null;

  init() {
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }

    this.db = firebase.app().database();
  }

  getAllTeams(callback, id) {
    this.usersRef = this.db.ref("/users");
    this.usersRef.on("value", snapshot => {
      var allTeams = [];
      for (var item in snapshot.val()) {
        var user = snapshot.val()[item];
        for (var team in user.teams) {
          var teamInfo = user.teams[team];
          teamInfo.key = team;
          teamInfo.owner = {
            displayName: user.displayName,
            pictureUrl: user.pictureUrl,
            id: item
          };
          console.log(id);
          if(id === undefined || item === id || this.isContributor(id, teamInfo)){
            allTeams.push(teamInfo);
          }
        }
      }
      callback(allTeams);
    });
  }

  isContributor = (id, team) => {
    var is = false;
    if(team.contributors && team.contributors.accepted && team.contributors.accepted.length > 0){
        var filtered = team.contributors.accepted.filter ((accepted) => {
            return accepted === id;
        });
        is = filtered && filtered.length > 0;
    }

    return is;
  }

  clear() {
    if (this.usersRef !== null) {
      this.usersRef.off("value");
    }
  }
}

export default TeamService;
