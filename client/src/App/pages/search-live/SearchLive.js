import React from "react";
import { withStyles } from "@material-ui/core/styles";
import firebase from "firebase/app";
import "firebase/database";
import { firebaseConfig } from "../../App";
import ls from "local-storage";
import Game from "../../components/game/Game";
import "./SearchLive.scss";
import store from "../../store/store";
import { updateAppbar } from "../../actions/actions";
import { CircularProgress } from "@material-ui/core";

const styles = theme => ({
  header: {
    backgroundColor: theme.palette.background.paper
  },
  appBar: {
    top: "auto",
    bottom: 0
  },
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper
  },
  grow: {
    flexGrow: 1
  },
  subHeader: {
    backgroundColor: theme.palette.background.paper
  },
  buttonBase: {
    backgroundColor: theme.palette.primary.main
  }
});
class SearchLive extends React.Component {
  usersRef = null;
  filterUnsubscribe = null;

  constructor() {
    super();
    this.state = {
      loading: true,
      live: [],
      filter: ""
    };
  }

  subscribeFilter = () => {
    if (
      store.getState().appBar.inputSearch &&
      store.getState().appBar.inputSearch.trim() !== this.state.filter.trim()
    ) {
      this.setState({
        ...this.state,
        filter: store.getState().appBar.inputSearch.trim()
      });
    }
  };

  componentDidMount() {
    store.dispatch(updateAppbar("fabVisible", false));
    store.dispatch(updateAppbar("visible", true));
    store.dispatch(updateAppbar("searchButtonVisible", true));

    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    this.db = firebase.app().database();

    //var games = this.db.ref("/" + user.googleId + "/games");
    this.usersRef = this.db.ref("/users");
    this.usersRef.on("value", snapshot => {
      var live = [];
      for (var item in snapshot.val()) {
        var user = snapshot.val()[item];
        if (user.games) {
          for (var game in user.games) {
            if (user.games[game].live) {
              var gameInfo = user.games[game];
              gameInfo.owner = {
                displayName: user.displayName,
                pictureUrl: user.pictureUrl,
                id: item
              };
              live.push(gameInfo);
            }
          }
        }
      }
      this.setState({ live: live, loading: false });
    });

    this.filterUnsubscribe = store.subscribe(this.subscribeFilter.bind(this));
  }

  componentWillUnmount() {
    this.usersRef.off("value");
    this.filterUnsubscribe();
  }

  openGame(owner, id) {
    var self = this;
    setTimeout(function() {
      var user = ls.get("user");
      if (user && owner.id === user.id) {
        self.props.history.push("/match/" + id);
      } else {
        self.props.history.push("/match/" + id + "/" + owner.id);
      }
    }, 200);
  }

  render() {
    const { loading, live, filter } = this.state;
    return (
      <div style={{ marginBottom: "70px" }}>
        <h1 className="search-title">Partite in corso:</h1>
        {loading ? (
          <CircularProgress className="progress" />
        ) : (
          <React.Fragment>
            {live &&
              live.map((game, index) => {
                var title = game.teamA + " vs " + game.teamB;
                if (title.indexOf(filter) >= 0) {
                  return (
                    <Game
                      key={game.id}
                      game={game}
                      index={index}
                      onClick={this.openGame.bind(this, game.owner)}
                      opening={false}
                      owner={game.owner}
                    />
                  );
                } else {
                  return "";
                }
              })}
          </React.Fragment>
        )}
      </div>
    );
  }
}
export default withStyles(styles, { withTheme: true })(SearchLive);
