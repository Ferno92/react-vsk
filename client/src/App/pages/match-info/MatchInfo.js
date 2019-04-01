import React from "react";
import { Undo, Face } from "@material-ui/icons";
import ResultButton from "../../components/resultButton/ResultButton";
import SetHistoryDialog from "../../components/SetHistoryDialog";
import ListItem from "@material-ui/core/ListItem";
import List from "@material-ui/core/List";
import Divider from "@material-ui/core/Divider";
import Button from "@material-ui/core/Button";
import firebase from "firebase/app";
import "firebase/database";
import ls from "local-storage";
import { firebaseConfig } from "../../App";
import { DialogTitle, Dialog, Chip, Avatar, DialogContent, DialogContentText, DialogActions } from "@material-ui/core";

class MatchInfo extends React.Component {
  state = {
    currentGame: this.props.currentGame,
    selectedSet: {
      open: false,
      history: []
    },
    spectator: false,
    gameRef: null,
    gameUrl: "",
    audience: [],
    showAudience: false,
    scoutEnabled: false,
    alertFormationDialogOpen: false
  };
  audienceRef = null;
  isUnmount = false;

  componentWillReceiveProps(nextProps) {
    if (nextProps.currentGame !== null) {
      this.setState({
        currentGame: nextProps.currentGame,
        spectator: nextProps.spectator,
        gameRef: nextProps.gameRef,
        gameUrl: nextProps.gameUrl
      });
      if (
        this.isSetOver(nextProps.currentGame) &&
        (nextProps.currentGame.resultA < 3 && nextProps.currentGame.resultB < 3)
      ) {
        console.log("isSetOver", nextProps.currentGame);
        var a =
          nextProps.currentGame.sets[nextProps.currentGame.sets.length - 1].a;
        var b =
          nextProps.currentGame.sets[nextProps.currentGame.sets.length - 1].b;
        if (a > b) {
          nextProps.currentGame.resultA++;
        } else {
          nextProps.currentGame.resultB++;
        }
        nextProps.currentGame.live = false;
        console.log(nextProps.currentGame);
        nextProps.gameRef.update(nextProps.currentGame);
      }
      if (this.audienceRef === null) {
        var self = this;
        setTimeout(function() {
          self.initAudienceObserver(nextProps.gameUrl);
        }, 2000);
      }
    }
  }

  componentWillUnmount() {
    if (this.audienceRef !== null) {
      this.audienceRef.off("value");

      var audienceWithoutMe = this.state.audience.slice();
      var userId = ls.get("user")
        ? ls.get("user").id
        : ls.get("anonymous").code;
      if (this.getAudienceIndex(audienceWithoutMe, userId) >= 0) {
        audienceWithoutMe.splice(
          this.getAudienceIndex(audienceWithoutMe, userId),
          1
        );
        this.audienceRef.set(audienceWithoutMe);
      }
    }
    this.isUnmount = true;
  }

  add(team) {
    var setsMissing = {
      a: team === "resultA" ? 1 : 0,
      b: team === "resultA" ? 0 : 1,
      hasBall: team === "resultA" ? "a" : "b",
      history: []
    };
    var isBallChanged = this.isBallChanged(
      this.state.currentGame.sets
        ? this.state.currentGame.sets[this.state.currentGame.sets.length - 1]
        : null,
      team
    );
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
                ][team === "resultA" ? "a" : "b"] + 1,
              hasBall: team === "resultA" ? "a" : "b"
            }
          }
        : [setsMissing]
    };
    var bluePrintFormation = this.printFormation();
    if (
      currentGame.sets[Object.keys(currentGame.sets).length - 1].history !==
      undefined
    ) {
      currentGame.sets[Object.keys(currentGame.sets).length - 1].history.push(
        team === "resultA"
          ? { a: "x", b: "-", formation: bluePrintFormation }
          : { a: "-", b: "x", formation: bluePrintFormation }
      );
    } else {
      currentGame.sets[Object.keys(currentGame.sets).length - 1].history = [
        team === "resultA"
          ? { a: "x", b: "-", formation: bluePrintFormation }
          : { a: "-", b: "x", formation: bluePrintFormation }
      ];
    }

    if (this.isSetOver(currentGame)) {
      // the set is over
      currentGame[team]++;

      if (currentGame.resultA === 3 || currentGame.resultB === 3) {
        currentGame.live = false;
      } else {
        currentGame.sets[Object.keys(currentGame.sets).length] = { a: 0, b: 0 };
      }
    }
    if (currentGame.formation && isBallChanged) {
      currentGame.formation.players = this.rotateFormation(
        currentGame.formation,
        false
      );
    }
    if(currentGame.sets[Object.keys(currentGame.sets).length - 1].a + currentGame.sets[Object.keys(currentGame.sets).length - 1].b === 1){
      this.setState({alertFormationDialogOpen: true});
    }
    this.state.gameRef.update(currentGame);
  }

  isSetOver = currentGame => {
    if (currentGame.sets) {
      var max = Object.keys(currentGame.sets).length === 5 ? 15 : 25;

      return (
        (currentGame.sets[Object.keys(currentGame.sets).length - 1].a >= max ||
          currentGame.sets[Object.keys(currentGame.sets).length - 1].b >=
            max) &&
        Math.abs(
          currentGame.sets[Object.keys(currentGame.sets).length - 1].a -
            currentGame.sets[Object.keys(currentGame.sets).length - 1].b
        ) >= 2
      );
    } else {
      return false;
    }
  };

  printFormation = () => {
    var print = [];
    const {formation} = this.state.currentGame
    if (formation && formation.players) {
      var temp = formation.players.slice();
      temp.sort(function compare(a,b) {
        if (a.position < b.position)
          return -1;
        if (a.position > b.position)
          return 1;
        return 0;
      })
      temp.forEach(player => {
        print.push(player.id);
      });
    }
    return print;
  };

  rotateFormation = (formation, old) => {
    var tempPlayers = formation.players ? formation.players.slice() : [];
    var self = this;
    tempPlayers.forEach(player => {
      if (old) {
        player.position = self.getOldPosition(player.position);
      } else {
        player.position = self.getNewPosition(player.position);
      }
    });
    return tempPlayers;
  };

  getNewPosition = oldPos => {
    return oldPos - 1 < 1 ? 6 : oldPos - 1;
  };

  getOldPosition = oldPos => {
    return oldPos + 1 > 6 ? 1 : oldPos + 1;
  };

  isBallChanged = (currentSet, team) => {
    return currentSet
      ? currentSet.hasBall === "b" && team !== "resultB"
        ? true
        : false
      : true;
  };

  remove(team) {
    var setsMissing = {
      a: 0,
      b: 0,
      hasBall: null
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
                ][team === "resultA" ? "a" : "b"] > 0
                  ? this.state.currentGame.sets[
                      this.state.currentGame.sets.length - 1
                    ][team === "resultA" ? "a" : "b"] - 1
                  : 0
            }
          }
        : [setsMissing]
    };
    var penultimo = this.removeLastHistoryFor(currentGame, team);
    if (
      penultimo &&
      ((penultimo.a !== "x" && team === "resultA") ||
        (penultimo.b !== "x" && team === "resultB"))
    ) {
      currentGame.formation.players = this.rotateFormation(
        currentGame.formation,
        true
      );
    }
    if (
      Object.keys(currentGame.sets).length - 1 >= 0 &&
      currentGame.sets[Object.keys(currentGame.sets).length - 1].history
        .length > 0
    ) {
      currentGame.sets[Object.keys(currentGame.sets).length - 1].hasBall =
        currentGame.sets[Object.keys(currentGame.sets).length - 1].history[
          currentGame.sets[Object.keys(currentGame.sets).length - 1].history
            .length - 1
        ].a === "x"
          ? "a"
          : "b";
    } else {
      currentGame.sets[Object.keys(currentGame.sets).length - 1].hasBall = null;
    }
    this.state.gameRef.update(currentGame);
  }

  removeLastHistoryFor(currentGame, team) {
    var penultimo = null;
    if (
      currentGame.sets[Object.keys(currentGame.sets).length - 1].history !==
      undefined
    ) {
      var foundIndex = -1;
      for (
        var i =
          currentGame.sets[Object.keys(currentGame.sets).length - 1].history
            .length - 1;
        i >= 0;
        i--
      ) {
        if (
          (team === "resultA" &&
            currentGame.sets[Object.keys(currentGame.sets).length - 1].history[
              i
            ].a === "x") ||
          (team === "resultB" &&
            currentGame.sets[Object.keys(currentGame.sets).length - 1].history[
              i
            ].b === "x")
        ) {
          if (i >= 0 && foundIndex === -1) {
            penultimo = i === 0 ? null :
              currentGame.sets[Object.keys(currentGame.sets).length - 1]
                .history[i - 1];
            foundIndex = i;
          }
        }
      }
      if (foundIndex > -1) {
        currentGame.sets[
          Object.keys(currentGame.sets).length - 1
        ].history.splice(foundIndex, 1);
      }
    }
    return penultimo;
  }

  undo() {
    var team = "";
    var currentGame = {
      ...this.state.currentGame
    };
    currentGame.sets.splice(currentGame.sets.length - 1, 1);
    if (
      currentGame.sets[currentGame.sets.length - 1].a >
      currentGame.sets[currentGame.sets.length - 1].b
    ) {
      currentGame.sets[currentGame.sets.length - 1].a--;
      currentGame.resultA--;
      team = "resultA";
    } else {
      currentGame.sets[currentGame.sets.length - 1].b--;
      currentGame.resultB--;
      team = "resultB";
    }
    this.removeLastHistoryFor(currentGame, team);
    this.state.gameRef.update(currentGame);
  }

  closeHistory(set) {
    this.setState({ ...this.state, selectedSet: { ...set, open: false } });
  }

  openHistory(set) {
    if (set.history !== undefined) {
      this.setState({ ...this.state, selectedSet: { ...set, open: true } });
    }
  }

  initAudienceObserver = gameUrl => {
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }

    this.db = firebase.app().database();
    this.audienceRef = this.db.ref(gameUrl + "/audience");
    var self = this;
    this.audienceRef.on("value", snapshot => {
      var audience = snapshot.val() ? snapshot.val() : [];
      var userId = ls.get("user")
        ? ls.get("user").id
        : ls.get("anonymous").code;
      var name = ls.get("user")
        ? ls.get("user").name
        : "anonymous" + ls.get("anonymous").code;
      var picture = ls.get("user") ? ls.get("user").imageUrl : null;
      var audienceWithoutMe = audience.slice();
      if (self.getAudienceIndex(audience, userId) >= 0) {
        audienceWithoutMe.splice(self.getAudienceIndex(audience, userId), 1);
        self.audienceRef.onDisconnect().set(audienceWithoutMe);
      } else {
        if (self.state.spectator) {
          audience.push({ userId: userId, name: name, picture: picture });
        }
        self.audienceRef.set(audience);
      }
      if (!self.isUnmount) {
        self.setState({ audience: audience });
      }
    });
  };

  getAudienceIndex = (audience, id) => {
    var index = -1;
    for (var i = 0; i < audience.length; i++) {
      if (audience[i].userId === id) {
        index = i;
      }
    }
    return index;
  };

  showAudience = show => {
    this.setState({ ...this.state, showAudience: show });
  };

  onChangeScout = () => {
    this.setState({ ...this.state, scoutEnabled: !this.state.scoutEnabled });
  };

  handleAlertFormationClose = ()=>{
    const {alertFormationDialogOpen} = this.state
    this.setState({alertFormationDialogOpen: !alertFormationDialogOpen});
  }

  render() {
    const {alertFormationDialogOpen, currentGame, spectator, audience, showAudience, selectedSet} = this.state
    return (
      <div>
        {/*!this.state.spectator && (
          <FormControlLabel
            control={
              <Switch
                checked={this.state.scoutEnabled}
                onChange={this.onChangeScout.bind(this)}
                value="scout"
                color="primary"
              />
            }
            label="Abilita scout"
          />
          )*/}
        {currentGame && currentGame.live && (
          <div className="flex-container set-info">
            <div className="flex-child-bigger">
              {currentGame ? currentGame.resultA : ""}
            </div>
            <div className="flex-child separator">-</div>

            <div className="flex-child-bigger">
              {currentGame ? currentGame.resultB : ""}
            </div>
          </div>
        )}

        <div className="flex-container">
          <div className="flex-child">
            <p className="team-name">
              {currentGame ? currentGame.teamA : ""}
            </p>
            <ResultButton
              result={
                currentGame
                  ? currentGame.live
                    ? currentGame.sets
                      ? currentGame.sets[
                          currentGame.sets.length - 1
                        ].a
                      : 0
                    :currentGame.resultA
                  : 0
              }
              team={0}
              add={this.add.bind(this, "resultA")}
              remove={this.remove.bind(this, "resultA")}
              disabled={
                currentGame ? !currentGame.live : true
              }
              spectator={spectator}
            />
          </div>
          <div className="flex-child">
            <p className="team-name">
              {currentGame ? currentGame.teamB : ""}
            </p>
            <ResultButton
              result={
                currentGame
                  ? currentGame.live
                    ? currentGame.sets
                      ? currentGame.sets[
                          currentGame.sets.length - 1
                        ].b
                      : 0
                    : currentGame.resultB
                  : 0
              }
              team={1}
              add={this.add.bind(this, "resultB")}
              remove={this.remove.bind(this, "resultB")}
              disabled={
                currentGame ? !currentGame.live : true
              }
              spectator={spectator}
            />
          </div>
        </div>
        <div className="undo-container">
          {currentGame !== null &&
            currentGame.live &&
            (currentGame.resultA !== 0 ||
              currentGame.resultB !== 0) &&
            currentGame.sets[currentGame.sets.length - 1]
              .a === 0 &&
            currentGame.sets[currentGame.sets.length - 1]
              .b === 0 && (
              <Button
                variant="contained"
                color="primary"
                onClick={this.undo.bind(this)}
              >
                <Undo />
                Back
              </Button>
            )}
        </div>
        <div className="set-list">
          <Button
            className="audience-button"
            color="primary"
            variant="outlined"
            onClick={
              audience.length > 0
                ? this.showAudience.bind(this, true)
                : function() {}
            }
          >
            Spettatori: {audience.length}
          </Button>
          <Dialog
            onClose={this.showAudience.bind(this, false)}
            open={showAudience}
          >
            <DialogTitle
              id="customized-dialog-title"
              onClose={this.showAudience.bind(this, false)}
            >
              Spettatori
            </DialogTitle>
            {currentGame &&
              currentGame.audience &&
              currentGame.audience.map((people, index) => {
                return (
                  <Chip
                    style={{ margin: "10px", justifyContent: "end" }}
                    color="primary"
                    label={people.name}
                    key={people.userId}
                    variant="outlined"
                    avatar={
                      <Avatar src={people.picture ? people.picture : ""}>
                        {people.picture ? "" : <Face />}
                      </Avatar>
                    }
                  />
                );
              })}
          </Dialog>
          <List>
            {currentGame && currentGame.sets
              ? currentGame.sets.map((set, index) => {
                  var inCorso = (
                    <div key={index}>
                      <ListItem
                        button
                        style={{ display: "block" }}
                        onClick={this.openHistory.bind(this, set)}
                      >
                        <div className="set-title">{index + 1 + "° SET: "}</div>
                        <div className="flex-container">
                          <div className={"flex-child"}>In corso...</div>
                        </div>
                      </ListItem>
                      <Divider />
                    </div>
                  );
                  return index ===
                    (currentGame
                      ? currentGame.sets.length - 1
                      : 0) && currentGame.live ? (
                    inCorso
                  ) : (
                    <div key={index}>
                      <ListItem
                        button
                        style={{ display: "block" }}
                        onClick={this.openHistory.bind(this, set)}
                      >
                        <div className="set-title">{index + 1 + "° SET: "}</div>
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

        <SetHistoryDialog
          history={selectedSet.history}
          open={
            selectedSet.open !== undefined &&
            selectedSet.open
          }
          close={this.closeHistory.bind(this, selectedSet)}
        />
        {/* __________________- Alert dialog change formation -___________________ */}
        <Dialog
          open={alertFormationDialogOpen}
          onClose={this.handleAlertFormationClose}
        >
          <DialogTitle>{"Hai aggiornato la formazione?"}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Ricordati di aggiornare la formazione per poter tracciare l'andamento dei giocatori durante la partita.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleAlertFormationClose} color="primary" autoFocus>
              Ok, ho capito
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

export default MatchInfo;
