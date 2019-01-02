import React from 'react';
import * as firebase from 'firebase';
import ls from "local-storage";
import Game from "./Game";
import "./Game.scss";

const firebaseConfig = {
  apiKey: "AIzaSyDBvxVAYOPwEk2ApbU_DfQ-tmcgOfJ6k4Y",
  authDomain: "ionicvsk.firebaseapp.com",
  databaseURL: "https://ionicvsk.firebaseio.com",
  projectId: "ionicvsk",
  storageBucket: "",
  messagingSenderId: "589403062376"
};

class Dashboard extends React.Component {

  componentDidMount() {
    this.setState({ games: [] });
    var user = ls.get("user");
    if (user !== null) {
      var app = firebase.initializeApp(firebaseConfig);

      this.db = app.database();

      //var games = this.db.ref("/" + user.googleId + "/games");
      var games = this.db.ref("users/SnTg4iqWQ4WnwFkIDhh7WmtTHFo2/games");
      games.on("value", snapshot => {
        console.log(snapshot.val());

        var data_list = [];
        snapshot.forEach(function (childSnapshot) {
          var childData = childSnapshot.val();
          data_list.push(childData);
        });
        console.log("data_list", data_list);
        this.setState({ games: data_list });
      })
    }
  }

  render() {
    return (
      <div>
        {
          this.state != null?
            this.state.games.map(game => {
            return (<Game key={game.id} game={game}/>)
          })
          : ""
        }
      </div>
    );
  }
}

export default (Dashboard);
