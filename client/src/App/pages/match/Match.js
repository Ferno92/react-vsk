import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import ArrowBack from "@material-ui/icons/ArrowBack";
import Undo from "@material-ui/icons/Undo";
import Button from "@material-ui/core/Button";
import Delete from "@material-ui/icons/Delete";
import Share from "@material-ui/icons/Share";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import SwipeableViews from "react-swipeable-views";
import store from "../../store/store";
import { updateAppbar, updateCreateMatch } from "../../actions/actions";
import firebase from "firebase/app";
import "firebase/database";
import ls from "local-storage";
import { firebaseConfig } from "../../App";
import "./Match.scss";
import ResultButton from "../../components/resultButton/ResultButton";
import SetHistoryDialog from "../../components/SetHistoryDialog";
import ListItem from "@material-ui/core/ListItem";
import List from "@material-ui/core/List";
import Divider from "@material-ui/core/Divider";
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import MoreVertIcon from '@material-ui/icons/MoreVert';

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
    currentGame: null,
    selectedSet: {
      open: false,
      history: []
    },
    confirmDialogOpen: false,
    spectator: false,
    anchorEl: null
  };
  gameRef = null;

  componentDidMount() {

    store.dispatch(updateCreateMatch("save", false));
    store.dispatch(updateAppbar("visible", false));
    var user = ls.get("user");
    var userId = "";
    if (user !== null && (this.props.match.params.owner === undefined || this.props.match.params.owner === user.googleId)) {
      userId = user.googleId;
    } else {
      userId = this.props.match.params.owner;
      this.setState({ ...this.state, spectator: true })
    }
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }

    this.db = firebase.app().database();

    //var games = this.db.ref("/" + userId + "/games");
    this.gameRef = this.db.ref(
      "users/SnTg4iqWQ4WnwFkIDhh7WmtTHFo2/games/" + this.props.match.params.id
    );
    this.gameRef.on("value", snapshot => {
      this.setState(prevState => ({
        ...prevState,
        currentGame: snapshot.val()
      }));
      // console.log(this.state.currentGame);
    });
  }

  componentWillUnmount() {
    this.gameRef.off("value");
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

  add(team) {
    var setsMissing = {
      a: team === "resultA" ? 1 : 0,
      b: team === "resultA" ? 0 : 1,
      history: []
    };
    var currentGame = {
      ...this.state.currentGame,
      sets: this.state.currentGame.sets
        ? {
          ...this.state.currentGame.sets,
          [this.state.currentGame.sets.length - 1]: {
            ...this.state.currentGame.sets[
            this.state.currentGame.sets.length - 1
            ],
            [team === "resultA" ? "a" : "b"]:
              this.state.currentGame.sets[
              this.state.currentGame.sets.length - 1
              ][team === "resultA" ? "a" : "b"] + 1
          }
        }
        : [setsMissing]
    };
    if (currentGame.sets[Object.keys(currentGame.sets).length - 1].history !== undefined) {
      currentGame.sets[Object.keys(currentGame.sets).length - 1].history.push(team === "resultA" ? { a: "x", b: "-" } : { a: "-", b: "x" });
    } else {
      currentGame.sets[Object.keys(currentGame.sets).length - 1].history = [team === "resultA" ? { a: "x", b: "-" } : { a: "-", b: "x" }];
    }

    if ((currentGame.sets[
      Object.keys(currentGame.sets).length - 1
    ].a >= 25 || currentGame.sets[
      Object.keys(currentGame.sets).length - 1
    ].b >= 25) && Math.abs(currentGame.sets[
      Object.keys(currentGame.sets).length - 1
    ].a - currentGame.sets[
      Object.keys(currentGame.sets).length - 1
    ].b) >= 2) {
      // the set is over
      currentGame[team]++;

      if (currentGame.resultA === 3 || currentGame.resultB === 3) {
        currentGame.live = false;
      } else {

        currentGame.sets[Object.keys(currentGame.sets).length] = { a: 0, b: 0 };
      }
    }
    this.gameRef.update(currentGame);
  }

  remove(team) {
    var setsMissing = {
      a: 0,
      b: 0
    };
    var currentGame = {
      ...this.state.currentGame,
      sets: this.state.currentGame.sets
        ? {
          ...this.state.currentGame.sets,
          [this.state.currentGame.sets.length - 1]: {
            ...this.state.currentGame.sets[
            this.state.currentGame.sets.length - 1
            ],
            [team === "resultA" ? "a" : "b"]:
              this.state.currentGame.sets[
                this.state.currentGame.sets.length - 1
              ][team === "resultA" ? "a" : "b"] > 0 ?
                this.state.currentGame.sets[
                this.state.currentGame.sets.length - 1
                ][team === "resultA" ? "a" : "b"] - 1 : 0
          }
        }
        : [setsMissing]
    };
    this.removeLastHistoryFor(currentGame, team);

    this.gameRef.update(currentGame);
  }

  removeLastHistoryFor(currentGame, team) {
    if (currentGame.sets[Object.keys(currentGame.sets).length - 1].history !== undefined) {
      var foundIndex = -1;
      for (var i = currentGame.sets[Object.keys(currentGame.sets).length - 1].history.length - 1; i >= 0; i--) {
        if ((team === "resultA" && currentGame.sets[Object.keys(currentGame.sets).length - 1].history[i].a === "x") ||
          (team === "resultB" && currentGame.sets[Object.keys(currentGame.sets).length - 1].history[i].b === "x")) {
          foundIndex = i;
        }
      }
      if (foundIndex > -1) {
        currentGame.sets[Object.keys(currentGame.sets).length - 1].history.splice(foundIndex, 1);
      }
    }
  }

  undo() {
    var team = "";
    var currentGame = {
      ...this.state.currentGame
    };
    currentGame.sets.splice(currentGame.sets.length - 1, 1);
    if (currentGame.sets[currentGame.sets.length - 1].a > currentGame.sets[currentGame.sets.length - 1].b) {
      currentGame.sets[currentGame.sets.length - 1].a--;
      currentGame.resultA--;
      team = "resultA";
    } else {
      currentGame.sets[currentGame.sets.length - 1].b--;
      currentGame.resultB--;
      team = "resultB";
    }
    this.removeLastHistoryFor(currentGame, team);
    this.gameRef.update(currentGame);
  }

  deleteGame() {
    this.setState({ ...this.state, confirmDialogOpen: true });
  }

  closeHistory(set) {
    this.setState({ ...this.state, selectedSet: { ...set, open: false } });
  }

  openHistory(set) {
    if (set.history !== undefined) {
      this.setState({ ...this.state, selectedSet: { ...set, open: true } });
    }
  }

  handleCloseConfirmDialog(toDelete) {
    if (toDelete) {
      this.gameRef.remove();
      this.props.history.push("/");
    }
    this.setState({ ...this.state, confirmDialogOpen: false, anchorEl: null });

  }

  handleClickMenu = event => {
    this.setState({ ...this.state, anchorEl: event.currentTarget });
  };

  handleCloseMenu = () => {
    this.setState({ ...this.state, anchorEl: null });
  };

  share() {
    var url = window.location.origin;
    if (this.state.spectator) {
      // same url
      url += this.props.pathname;
    } else {
      // url += this.props.pathname + "/" + ls.get("user").googleId;
      url += this.props.pathname + "/SnTg4iqWQ4WnwFkIDhh7WmtTHFo2";
    }
    var newVariable = window.navigator;
    if (newVariable && newVariable.share) {
      newVariable
        .share({
          title: this.state.currentGame.teamA + " vs " + this.state.currentGame.teamB,
          text: "Segui la partita in diretta: ",
          url: url
        })
        .then(() => console.log("Successful share"))
        .catch(error => console.log("Error sharing", error));
    } else {
      alert("share not supported");
    }
  }

  render() {
    const { classes, theme } = this.props;
    const { anchorEl } = this.state;
    const openMenu = Boolean(anchorEl);

    return (
      <div className={classes.root}>
        <AppBar position="fixed" color="primary">
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="Menu"
              onClick={this.onBack.bind(this)}
            >
              <ArrowBack />
            </IconButton>
            <Typography variant="h6" color="inherit" className={classes.grow + " title-ellipsis"}>
              {this.state.currentGame
                ? this.state.currentGame.teamA +
                " vs " +
                this.state.currentGame.teamB
                : ""}
            </Typography>
            <IconButton
              color="inherit"
              aria-label="Menu"
              onClick={this.handleClickMenu.bind(this)}
            >
              <MoreVertIcon />
            </IconButton>
            <Menu
              id="long-menu"
              anchorEl={anchorEl}
              open={openMenu}
              onClose={this.handleCloseMenu}
              style={{ marginTop: "40px" }}
            >
              {!this.state.spectator && (
                <MenuItem key={"deleteGame"} onClick={this.deleteGame.bind(this)}>
                  Elimina
              <Delete />
                </MenuItem>
              )}

              <MenuItem key={"shareGame"} onClick={this.share.bind(this)}>
                Condividi
              <Share />
              </MenuItem>
            </Menu>


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
          className="tab-container"
        >
          <TabContainer dir={theme.direction}>
            {this.state.currentGame && this.state.currentGame.live && (
              <div className="flex-container set-info">
                <div className="flex-child-bigger">
                  {this.state.currentGame ? this.state.currentGame.resultA : ""}
                </div>
                <div className="flex-child separator">-</div>

                <div className="flex-child-bigger">
                  {this.state.currentGame ? this.state.currentGame.resultB : ""}
                </div>
              </div>
            )}

            <div className="flex-container">
              <div className="flex-child">
                <p className="team-name">
                  {this.state.currentGame ? this.state.currentGame.teamA : ""}
                </p>
                <ResultButton
                  result={
                    this.state.currentGame
                      ? this.state.currentGame.live ? this.state.currentGame.sets
                        ? this.state.currentGame.sets[
                          this.state.currentGame.sets.length - 1
                        ].a
                        : 0
                        : this.state.currentGame.resultA
                      : 0
                  }
                  team={0}
                  add={this.add.bind(this, "resultA")}
                  remove={this.remove.bind(this, "resultA")}
                  disabled={this.state.currentGame ? !this.state.currentGame.live : true}
                  spectator={this.state.spectator}
                />
              </div>
              <div className="flex-child">
                <p className="team-name">
                  {this.state.currentGame ? this.state.currentGame.teamB : ""}
                </p>
                <ResultButton
                  result={
                    this.state.currentGame
                      ?
                      this.state.currentGame.live ?
                        this.state.currentGame.sets
                          ? this.state.currentGame.sets[
                            this.state.currentGame.sets.length - 1
                          ].b
                          : 0
                        : this.state.currentGame.resultB
                      : 0
                  }
                  team={1}
                  add={this.add.bind(this, "resultB")}
                  remove={this.remove.bind(this, "resultB")}
                  disabled={this.state.currentGame ? !this.state.currentGame.live : true}
                  spectator={this.state.spectator}
                />
              </div>
            </div>
            <div className="undo-container">
              {this.state.currentGame !== null && this.state.currentGame.live && (this.state.currentGame.resultA !== 0 || this.state.currentGame.resultB !== 0) &&
                this.state.currentGame.sets[this.state.currentGame.sets.length - 1].a === 0 && this.state.currentGame.sets[this.state.currentGame.sets.length - 1].b === 0 && (
                  <Button variant="contained" color="primary" className={classes.button} onClick={this.undo.bind(this)}>
                    <Undo></Undo>
                    Back
            </Button>)}
            </div>
            <div className="set-list">
              <List>
                {this.state.currentGame && this.state.currentGame.sets
                  ? this.state.currentGame.sets.map((set, index) => {
                    var inCorso = (
                      <div key={index}>
                        <ListItem button style={{ display: "block" }} onClick={this.openHistory.bind(this, set)}>
                          <div className="set-title">
                            {index + 1 + "° SET: "}
                          </div>
                          <div className="flex-container">
                            <div className={"flex-child"}>In corso...</div>
                          </div>
                        </ListItem>
                        <Divider />
                      </div>
                    );
                    return index === (this.state.currentGame ? this.state.currentGame.sets.length - 1 : 0) && this.state.currentGame.live ? (
                      inCorso
                    ) : (
                        <div key={index}>
                          <ListItem button style={{ display: "block" }} onClick={this.openHistory.bind(this, set)}>
                            <div className="set-title">
                              {index + 1 + "° SET: "}
                            </div>
                            <div className="flex-container">
                              <div
                                className={
                                  "flex-child " + (set.a > set.b ? "bold" : "")
                                }
                              >
                                {set.a}
                              </div>
                              <div
                                className={
                                  "flex-child " + (set.b > set.a ? "bold" : "")
                                }
                              >
                                {set.b}
                              </div>
                            </div>
                          </ListItem>
                          <Divider />
                        </div>
                      );
                  })
                  : ""}
              </List>
            </div>

            <SetHistoryDialog history={this.state.selectedSet.history} open={this.state.selectedSet.open !== undefined && this.state.selectedSet.open} close={this.closeHistory.bind(this, this.state.selectedSet)} />
          </TabContainer>
          <TabContainer dir={theme.direction}>Item Two</TabContainer>
          <TabContainer dir={theme.direction}>Item Three</TabContainer>
        </SwipeableViews>
        <Dialog
          open={this.state.confirmDialogOpen}
          onClose={this.handleCloseConfirmDialog.bind(this, false)}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">{"Elimina partita"}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Sei sicuro di voler eliminare la partita?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleCloseConfirmDialog.bind(this, false)} color="primary">
              No
            </Button>
            <Button onClick={this.handleCloseConfirmDialog.bind(this, true)} color="primary" autoFocus>
              Si
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

Match.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles, { withTheme: true })(Match);
