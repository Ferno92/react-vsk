import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardActionArea from "@material-ui/core/CardActionArea";

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

  render() {
    return (
      <Card className={this.classes.card + " game-card"}>
        <CardActionArea>
          <CardContent>
            <div className="game-content" onClick={this.props.onClick}>
              <div
                className={
                  "float-left side-text live-text" +
                  (this.props.game.live ? "live" : "")
                }
              >
                {this.props.game.live ? "Live" : "Punteggio finale"}
              </div>
              <div className="float-right side-text">
                {this.props.game.date !== undefined ? this.props.game.date.day : ""}
              </div>
              <div className="clear">
                <div
                  className={
                    "float-left relevant-text" +
                    (this.props.game.resultA > this.props.game.resultB ? "winner" : "")
                  }
                >
                  {this.props.game.teamA}
                </div>
                <div
                  className={
                    "float-right relevant-text" +
                    (this.props.game.resultA > this.props.game.resultB ? "winner" : "")
                  }
                >
                  {this.props.game.resultA}
                </div>
              </div>
              <div className="clear">
                <div
                  className={
                    "float-left relevant-text" +
                    (this.props.game.resultB > this.props.game.resultA ? "winner" : "")
                  }
                >
                  {this.props.game.teamB}
                </div>
                <div
                  className={
                    "float-right relevant-text" +
                    (this.props.game.resultB > this.props.game.resultA ? "winner" : "")
                  }
                >
                  {this.props.game.resultB}
                </div>
              </div>
              <div className="clear side-text">{this.props.game.location.name}</div>
            </div>
          </CardContent>
        </CardActionArea>
      </Card>
    );
  }
}

Game.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Game);
