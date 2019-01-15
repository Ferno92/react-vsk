import React from "react";
import firebase from "firebase/app";
import "firebase/database";
import ls from "local-storage";
import Game from "../components/game/Game";
import "../components/game/Game.scss";
import CreateMatch from "../pages/create-match/CreateMatch";
import { connect } from "react-redux";
import store from "../store/store";
import { updateAppbar } from "../actions/actions";
import { firebaseConfig } from "../App";
import * as moment from "moment";

const mapStateToProps = state => {
  return {
    createMatchOpen: state.dashboard.createMatchOpen
  };
};
var gamesRef = null;

class Dashboard extends React.Component {
  count = 0;
  storeUnsubscribe = null;

  componentDidMount() {
    this.setState({ games: [] });
    var user = ls.get("user");
    if (user !== null) {
      if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
      }

      this.db = firebase.app().database();

      gamesRef = this.db.ref("/users/" + user.googleId + "/games");
      gamesRef.on("value", snapshot => {
        console.log(snapshot.val());

        var data_list = [];
        snapshot.forEach(function(childSnapshot) {
          var childData = childSnapshot.val();
          data_list.push(childData);
        });
        console.log("data_list", data_list);
        this.setState({ games: data_list });
      });
    }

    if (!store.getState().appBar.visible) {
      store.dispatch(updateAppbar("visible", true));
    }
    if (!store.getState().appBar.fabVisible) {
      store.dispatch(updateAppbar("search", false));
      store.dispatch(updateAppbar("searchInput", ""));
      store.dispatch(updateAppbar("fabVisible", true));
    }

    this.storeUnsubscribe = store.subscribe(this.goToNewMatch.bind(this));
  }

  
  goToNewMatch() {
    if (store.getState().createMatch.save) {
      console.log("" + this.count, store.getState());
      const newGameRef = gamesRef.push();

      var date = {
        ms: moment(new Date()).valueOf(),
        day: moment(new Date()).format("MMM/DD")
      };
      const promise = newGameRef.set({
        id: newGameRef.key,
        teamA: store.getState().createMatch.teamA,
        teamB: store.getState().createMatch.teamB,
        resultA: 0,
        resultB: 0,
        date: date,
        // location: location,
        live: true
        // homeTeamId: this.teamId
      });
      promise.then(() => {
        this.openGame(newGameRef.key);
      });
    }
  }

  componentWillUnmount() {
    gamesRef.off("value");
    if(this.storeUnsubscribe !== null){
      this.storeUnsubscribe();
    }
  }

  openGame(id) {
    var self = this;
    setTimeout(function() {
      self.props.history.push("/match/" + id);
    }, 200);
  }

  render() {
    return (
      <div style={{ marginBottom: "70px" }}>
        {this.state != null
          ? this.state.games.map((game, index) => {
              return (
                <Game
                  key={game.id}
                  game={game}
                  index={index}
                  onClick={this.openGame.bind(this)}
                  opening={false}
                />
              );
            })
          : ""}

        {/* create dialog */}
        <CreateMatch />
      </div>
    );
  }
}

export default connect(mapStateToProps)(Dashboard);
