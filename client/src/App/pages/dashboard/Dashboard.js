import React from "react";
import firebase from "firebase/app";
import "firebase/database";
import ls from "local-storage";
import Game from "../../components/game/Game";
import "../../components/game/Game.scss";
import CreateMatch from "..//create-match/CreateMatch";
import { connect } from "react-redux";
import store from "../../store/store";
import { updateAppbar, showCreateMatch } from "../../actions/actions";
import { firebaseConfig } from "../../App";
import * as moment from "moment";
import Button from "@material-ui/core/Button";
import "./Dashboard.scss";
import { Link } from "react-router-dom";
import Grid from "@material-ui/core/Grid";

const mapStateToProps = state => {
  return {
    createMatchOpen: state.dashboard.createMatchOpen
  };
};
var gamesRef = null;

class Dashboard extends React.Component {
  count = 0;
  storeUnsubscribe = null;
  loggedIn = false;

  componentDidMount() {
    this.setState({ games: [] });
    var user = ls.get("user");
    if (user !== null) {
      console.log(user);
      this.loggedIn = true;
      if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
      }

      this.db = firebase.app().database();

      gamesRef = this.db.ref("/users/" + user.id + "/games");
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

    //prevent back button
    window.history.pushState(null, null, window.location.href);
    window.onpopstate = function(event) {
      // window.history.go(1);
      //close create

      store.dispatch(showCreateMatch(false));
    };
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
    if (gamesRef !== null) {
      gamesRef.off("value");
    }
    if (this.storeUnsubscribe !== null) {
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
        {this.state != null && this.loggedIn && this.state.games.length > 0
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
          : (this.state != null && this.loggedIn && this.state.games.length === 0 ?
            (
              <Grid container justify = "center" className="empty_games_container"> 
              <div className="empty-games-image" style={{backgroundImage: "url(/images/volley_empty_list.png)"}}></div>
              <div className="empty-games-description">Non hai partite salvate.. Incomincia creandone una o naviga nel menu per vedere le partite in corso!</div>
            </Grid>)
            : "")}
        {!this.loggedIn && (
          <div className="ask-login">
            <div className="ask-login-title">
              Effettua il login per accedere a più funzionalità!
            </div>
            <Button className="to-login"
              variant="contained"
              color="primary"
              key={"Login"}
              component={Link}
              to="/login"
            >
              Login
            </Button>
          </div>
        )}

        {/* create dialog */}
        <CreateMatch />
      </div>
    );
  }
}

export default connect(mapStateToProps)(Dashboard);
