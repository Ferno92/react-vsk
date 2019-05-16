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
import { Button, Grid, CircularProgress } from "@material-ui/core";
import "./Dashboard.scss";
import { Link } from "react-router-dom";

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

  constructor() {
    super();
    this.state = {
      loading: true
    };
  }

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
        var data_list = [];
        snapshot.forEach(function(childSnapshot) {
          var childData = childSnapshot.val();
          data_list.push(childData);
        });
        data_list.reverse();
        this.setState({ games: data_list, loading: false });
      });
    } else {
      store.dispatch(updateAppbar("fabVisible", false));
      this.setState({ loading: false });
    }

    if (!store.getState().appBar.visible) {
      store.dispatch(updateAppbar("visible", true));
    }
    if (!store.getState().appBar.fabVisible) {
      store.dispatch(updateAppbar("search", false));
      store.dispatch(updateAppbar("searchInput", ""));
      store.dispatch(updateAppbar("fabVisible", true));
    }
    store.dispatch(updateAppbar("searchButtonVisible", false));

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
    var gameLive = [];
    var gameEnded = [];
    const { loading, games } = this.state;

    if (this.state != null && this.loggedIn) {
      games.forEach((game, index) => {
        if (game.live) {
          gameLive.push(game);
        } else {
          gameEnded.push(game);
        }
      });
    }

    return (
      <div style={{ marginBottom: "70px" }}>
        {loading ? (
          <CircularProgress className="progress" />
        ) : (
          <React.Fragment>
            {this.state != null &&
              this.loggedIn &&
              games.length > 0 && (
                <h1 style={{ textAlign: "center" }}>Le mie partite:</h1>
              )}

            {/* game live list */}
            {gameLive.length > 0 && (
              <div className="titles">Partite in corso</div>
            )}
            {gameLive.map((game, index) => {
              return (
                <Game
                  key={game.id}
                  game={game}
                  index={index}
                  onClick={this.openGame.bind(this)}
                  opening={false}
                />
              );
            })}

            {/* game ended list */}
            {gameEnded.length > 0 && (
              <div className="titles">Partite terminate</div>
            )}
            {gameEnded.length > 0 &&
              gameEnded.map((game, index) => {
                return (
                  <Game
                    key={game.id}
                    game={game}
                    index={index}
                    onClick={this.openGame.bind(this)}
                    opening={false}
                  />
                );
              })}

            {/* no game in list */}
            {this.state != null &&
              this.loggedIn &&
              games.length === 0 && (
                <Grid
                  container
                  justify="center"
                  className="empty_games_container"
                >
                  <div className="flex-container">
                    <div
                      className="empty-games-image"
                      style={{
                        backgroundImage: "url(/images/volley_empty_list.png)"
                      }}
                    />
                    <div className="empty-games-description">
                      Non hai partite salvate.. Incomincia creandone una o
                      naviga nel menu per vedere le partite in corso!
                    </div>
                  </div>
                </Grid>
              )}

            {/* not logged in */}
            {!this.loggedIn && (
              <div className="ask-login">
                <div className="ask-login-title">
                  Effettua il login per accedere a più funzionalità!
                </div>
                <Button
                  className="to-login"
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
          </React.Fragment>
        )}
      </div>
    );
  }
}

export default connect(mapStateToProps)(Dashboard);
