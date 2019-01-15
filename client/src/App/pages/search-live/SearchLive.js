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
  gamesRef = null;
  state = {
    live: [],
    filter: ""
  };
  filterUnsubscribe = null;

  subscribeFilter = () =>{
    if(store.getState().appBar.inputSearch.trim() !== this.state.filter.trim()){
      this.setState({...this.state, filter: store.getState().appBar.inputSearch.trim()})
    }
  }

  componentDidMount() {
    store.dispatch(updateAppbar("fabVisible", false));

    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    this.db = firebase.app().database();

    //var games = this.db.ref("/" + user.googleId + "/games");
    this.gamesRef = this.db.ref("/users");
    this.gamesRef.on("value", snapshot => {
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
      this.setState({ ...this.state, live: live });
      console.log(live);
    });

    
    this.filterUnsubscribe = store.subscribe(this.subscribeFilter.bind(this));
  }
  
  componentWillUnmount(){
    this.gamesRef.off('value');
    this.filterUnsubscribe();
  }

  openGame(owner, id) {
    var self = this;
    setTimeout(function() {
      var user = ls.get("user");
      if (owner.id === user.googleId) {
        self.props.history.push("/match/" + id);
      } else {
        self.props.history.push("/match/" + id + "/" + owner.id);
      }
    }, 200);
  }

  render() {
    return (
      <div>
        <h1 className="search-title">Partite in corso:</h1>

        {this.state != null
          ? this.state.live.map((game, index) => {
            var title = game.teamA + " vs " + game.teamB;
            if(title.indexOf(this.state.filter) >= 0){
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
            }
            })
          : ""}
      </div>
    );
  }
}
export default withStyles(styles, { withTheme: true })(SearchLive);
