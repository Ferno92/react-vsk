import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardActionArea from "@material-ui/core/CardActionArea";
import Grow from "@material-ui/core/Grow";

const styles = {
  card: {
    minWidth: 275
  },
  bullet: {
    display: "inline-block",
    margin: "0 2px",
    transform: "scale(0.8)"
  },
  title: {
    fontSize: 14
  },
  pos: {
    marginBottom: 12
  }
};

class Game extends React.Component {
  classes = this.props;
  constructor(props) {
    super(props);

    this.state = { opening: props.opening };
  }

  onClickGame() {
    this.setState({ opening: true });
    this.props.onClick(this.props.game.id);
  }

  getNameChar() {
    var matches = this.props.owner.displayName.match(/\b(\w)/g); // ['J','S','O','N']
    var acronym = matches.join("");
    return acronym;
  }

  render() {
    return (
      <Grow in={true} timeout={200 * this.props.index}>
        <Card
          className={
            this.classes.card +
            " game-card" +
            (this.state.opening ? " opening" : "")
          }
        >
          <CardActionArea style={{ height: "100%" }}>
            <CardContent style={{padding: 0}}>
              <div
                className="game-content"
                onClick={this.onClickGame.bind(this)}
              >
                {this.props.owner &&
                  (this.props.owner.pictureUrl || !this.props.owner.displayName ? (
                    <img
                      alt={this.props.owner.displayName}
                      className="owner"
                      src={this.props.owner.pictureUrl ? this.props.owner.pictureUrl : "/images/player.svg"}
                    />
                  ) : (
                    <div className="owner"><div className="initial-char">{this.getNameChar()}</div></div>
                  ))}
                <div
                  className={
                    "float-left side-text live-text " +
                    (this.props.game.live ? "live" : "")
                  }
                >
                  {this.props.game.live ? "Live" : "Punteggio finale"}
                </div>
                <div className="float-right side-text">
                  {this.props.game.date !== undefined
                    ? this.props.game.date.day
                    : ""}
                </div>
                <div className="clear">
                  <div
                    className={
                      "float-left relevant-text" +
                      (this.props.game.resultA > this.props.game.resultB
                        ? " winner"
                        : "") +
                      (this.state.opening ? " opening" : "")
                    }
                  >
                    {this.props.game.teamA}
                  </div>
                  <div
                    className={
                      "float-right relevant-text" +
                      (this.props.game.resultA > this.props.game.resultB
                        ? " winner"
                        : "")
                    }
                  >
                    {this.props.game.resultA}
                  </div>
                </div>
                <div className="clear">
                  <div
                    className={
                      "float-left relevant-text" +
                      (this.props.game.resultB > this.props.game.resultA
                        ? " winner"
                        : "") +
                      (this.state.opening ? " opening" : "")
                    }
                  >
                    {this.props.game.teamB}
                  </div>
                  <div
                    className={
                      "float-right relevant-text" +
                      (this.props.game.resultB > this.props.game.resultA
                        ? " winner"
                        : "")
                    }
                  >
                    {this.props.game.resultB}
                  </div>
                </div>
                <div className="clear side-text">
                  {this.props.game.location
                    ? this.props.game.location.name
                    : ""}
                </div>
              </div>
            </CardContent>
          </CardActionArea>
        </Card>
      </Grow>
    );
  }
}

Game.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Game);
