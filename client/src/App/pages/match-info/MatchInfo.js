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
import { DialogTitle, Dialog, Chip, Avatar } from "@material-ui/core";

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
    showAudience: false
  };
  audienceRef = null;

  constructor(props) {
    super(props);
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
    if (
      currentGame.sets[Object.keys(currentGame.sets).length - 1].history !==
      undefined
    ) {
      currentGame.sets[Object.keys(currentGame.sets).length - 1].history.push(
        team === "resultA" ? { a: "x", b: "-" } : { a: "-", b: "x" }
      );
    } else {
      currentGame.sets[Object.keys(currentGame.sets).length - 1].history = [
        team === "resultA" ? { a: "x", b: "-" } : { a: "-", b: "x" }
      ];
    }

    if (
      (currentGame.sets[Object.keys(currentGame.sets).length - 1].a >= 25 ||
        currentGame.sets[Object.keys(currentGame.sets).length - 1].b >= 25) &&
      Math.abs(
        currentGame.sets[Object.keys(currentGame.sets).length - 1].a -
          currentGame.sets[Object.keys(currentGame.sets).length - 1].b
      ) >= 2
    ) {
      // the set is over
      currentGame[team]++;

      if (currentGame.resultA === 3 || currentGame.resultB === 3) {
        currentGame.live = false;
      } else {
        currentGame.sets[Object.keys(currentGame.sets).length] = { a: 0, b: 0 };
      }
    }
    this.state.gameRef.update(currentGame);
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
                ][team === "resultA" ? "a" : "b"] > 0
                  ? this.state.currentGame.sets[
                      this.state.currentGame.sets.length - 1
                    ][team === "resultA" ? "a" : "b"] - 1
                  : 0
            }
          }
        : [setsMissing]
    };
    this.removeLastHistoryFor(currentGame, team);

    this.state.gameRef.update(currentGame);
  }

  removeLastHistoryFor(currentGame, team) {
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
          foundIndex = i;
        }
      }
      if (foundIndex > -1) {
        currentGame.sets[
          Object.keys(currentGame.sets).length - 1
        ].history.splice(foundIndex, 1);
      }
    }
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

  componentWillReceiveProps(nextProps) {
    this.setState({
      ...this.state,
      currentGame: nextProps.currentGame,
      spectator: nextProps.spectator,
      gameRef: nextProps.gameRef,
      gameUrl: nextProps.gameUrl
    });
    if (this.audienceRef === null) {
      var self = this;
      setTimeout(function() {
        self.initAudienceObserver(nextProps.gameUrl);
      }, 2000);
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
          var picture = ls.get("user")
            ? ls.get("user").imageUrl
            : null;
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
      self.setState({ ...self.state, audience: audience });
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

  render() {
    const { classes, theme } = this.props;
    return (
      <div>
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
                  ? this.state.currentGame.live
                    ? this.state.currentGame.sets
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
              disabled={
                this.state.currentGame ? !this.state.currentGame.live : true
              }
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
                  ? this.state.currentGame.live
                    ? this.state.currentGame.sets
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
              disabled={
                this.state.currentGame ? !this.state.currentGame.live : true
              }
              spectator={this.state.spectator}
            />
          </div>
        </div>
        <div className="undo-container">
          {this.state.currentGame !== null &&
            this.state.currentGame.live &&
            (this.state.currentGame.resultA !== 0 ||
              this.state.currentGame.resultB !== 0) &&
            this.state.currentGame.sets[this.state.currentGame.sets.length - 1]
              .a === 0 &&
            this.state.currentGame.sets[this.state.currentGame.sets.length - 1]
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
              this.state.audience.length > 0
                ? this.showAudience.bind(this, true)
                : function(){}
            }
          >
            Spettatori: {this.state.audience.length}
          </Button>
          <Dialog
            onClose={this.showAudience.bind(this, false)}
            open={this.state.showAudience}
          >
            <DialogTitle
              id="customized-dialog-title"
              onClose={this.showAudience.bind(this, false)}
            >
              Spettatori
            </DialogTitle>
            {this.state.currentGame &&
              this.state.currentGame.audience &&
              this.state.currentGame.audience.map((people, index) => {
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
            {this.state.currentGame && this.state.currentGame.sets
              ? this.state.currentGame.sets.map((set, index) => {
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
                    (this.state.currentGame
                      ? this.state.currentGame.sets.length - 1
                      : 0) && this.state.currentGame.live ? (
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
          history={this.state.selectedSet.history}
          open={
            this.state.selectedSet.open !== undefined &&
            this.state.selectedSet.open
          }
          close={this.closeHistory.bind(this, this.state.selectedSet)}
        />
      </div>
    );
  }
}

export default MatchInfo;
