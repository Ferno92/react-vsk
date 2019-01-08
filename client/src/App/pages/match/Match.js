import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import ArrowBack from "@material-ui/icons/ArrowBack";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import SwipeableViews from "react-swipeable-views";
import store from "../../store/index";
import { updateAppbar } from "../../actions/index";
import firebase from "firebase/app";
import "firebase/database";
import ls from "local-storage";
import { firebaseConfig } from "../../App";
import "./Match.scss";
import ResultButton from "../../components/resultButton/ResultButton";

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

function TabContainer({ children, dir }) {
  return (
    <Typography component="div" dir={dir} style={{ padding: 8 * 3 }}>
      {children}
    </Typography>
  );
}

TabContainer.propTypes = {
  children: PropTypes.node.isRequired,
  dir: PropTypes.string.isRequired
};

class Match extends React.Component {
  state = {
    value: 0,
    currentGame: null
  };
  gameRef = null;

  componentDidMount() {
    store.dispatch(updateAppbar("visible", false));
    var user = ls.get("user");
    if (user !== null) {
      if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
      }

      this.db = firebase.app().database();

      //var games = this.db.ref("/" + user.googleId + "/games");
      this.gameRef = this.db.ref(
        "users/SnTg4iqWQ4WnwFkIDhh7WmtTHFo2/games/" + this.props.match.params.id
      );
      this.gameRef.on("value", snapshot => {
        this.setState(prevState => ({
          ...prevState,
          currentGame: snapshot.val()
        }));
        console.log(this.state.currentGame);
      });
    }
  }

  handleChange = (event, value) => {
    this.setState(prevState => ({
      ...prevState,
      value: value
    }));
  };

  onBack() {
    this.props.history.push("/");
  }

  add(team){ 
    var currentGame = {...this.state.currentGame, [team]: this.state.currentGame[team] + 1}
    this.gameRef.update(currentGame);
  }

  remove(team){
    var currentGame = {...this.state.currentGame, [team]: this.state.currentGame[team] - 1}
    this.gameRef.update(currentGame);
  }

  render() {
    const { classes, theme } = this.props;

    return (
      <div className={classes.root}>
        <AppBar position="static" color="primary">
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="Menu"
              onClick={this.onBack.bind(this)}
            >
              <ArrowBack />
            </IconButton>
            <Typography variant="h6" color="inherit" className={classes.grow}>
              {this.state.currentGame
                ? this.state.currentGame.teamA +
                  " vs " +
                  this.state.currentGame.teamB
                : ""}
            </Typography>
          </Toolbar>
          <Tabs
            value={this.state.value}
            onChange={this.handleChange}
            indicatorColor="secondary"
            textColor="secondary"
            centered
          >
            <Tab
              label="Punteggio"
              style={this.state.value !== 0 ? { color: "#808080" } : {}}
            />
            <Tab
              label="Formazione"
              style={this.state.value !== 1 ? { color: "#808080" } : {}}
            />
            <Tab
              label="Chat"
              style={this.state.value !== 2 ? { color: "#808080" } : {}}
            />
          </Tabs>
        </AppBar>
        <SwipeableViews
          axis={theme.direction === "rtl" ? "x-reverse" : "x"}
          index={this.state.value}
          onChangeIndex={this.handleChangeIndex}
        >
          <TabContainer dir={theme.direction}>
            <div className="flex-container">
              <div className="flex-child">
                <p className="team-name">{this.state.currentGame ? this.state.currentGame.teamA : ""}</p>
                <ResultButton result={this.state.currentGame ? this.state.currentGame.resultA : 0} team={0} add={this.add.bind(this, "resultA")} remove={this.remove.bind(this, "resultA")}/>
              </div>
              <div className="flex-child">
                <p className="team-name">{this.state.currentGame ? this.state.currentGame.teamB : ""}</p>
                <ResultButton result={this.state.currentGame ? this.state.currentGame.resultB : 0} team={1}  add={this.add.bind(this, "resultB")} remove={this.remove.bind(this, "resultB")}/>  
              </div>

            </div>
          </TabContainer>
          <TabContainer dir={theme.direction}>Item Two</TabContainer>
          <TabContainer dir={theme.direction}>Item Three</TabContainer>
        </SwipeableViews>
      </div>
    );
  }
}

Match.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles, { withTheme: true })(Match);
