import React from "react";
import Undo from "@material-ui/icons/Undo";
import ResultButton from "../../components/resultButton/ResultButton";
import SetHistoryDialog from "../../components/SetHistoryDialog";
import ListItem from "@material-ui/core/ListItem";
import List from "@material-ui/core/List";
import Divider from "@material-ui/core/Divider";
import Button from "@material-ui/core/Button";

class MatchInfo extends React.Component{
    state = {
        currentGame: this.props.currentGame,
        selectedSet: {
          open: false,
          history: []
        },
        spectator: false,
        gameRef: null
    }

    constructor(props){
        super(props);
        console.log(props);
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
              ][team === "resultA" ? "a" : "b"] > 0 ?
                this.state.currentGame.sets[
                this.state.currentGame.sets.length - 1
                ][team === "resultA" ? "a" : "b"] - 1 : 0
          }
        }
        : [setsMissing]
    };
    this.removeLastHistoryFor(currentGame, team);

    this.state.gameRef.update(currentGame);
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

  componentWillReceiveProps(nextProps){
      this.setState({...this.state, currentGame: nextProps.currentGame, spectator: nextProps.spectator, gameRef: nextProps.gameRef});
  }

render(){
    const { classes, theme } = this.props;
    console.log("render match info props:", this.props);
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
        <Button variant="contained" color="primary" onClick={this.undo.bind(this)}>
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

        </div>
    );
}

}

export default MatchInfo;

