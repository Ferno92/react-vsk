import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardActionArea from "@material-ui/core/CardActionArea";
import Grow from "@material-ui/core/Grow";
import "./TeamCard.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

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

class TeamCard extends React.Component {
  classes = this.props;
  constructor(props) {
    super(props);

    this.state = { opening: props.opening };
  }

  onClickTeam() {
    this.setState({ ...this.state, opening: true });
    this.props.onClick(this.props.team.id);
  }

  render() {
    return (
      <Grow in={true} timeout={200 * this.props.index}>
        <Card
          className={
            this.classes.card +
            " team-card" +
            (this.state.opening ? " opening" : "")
          }
        >
          <CardActionArea style={{ height: "100%" }}>
            <CardContent>
              <div
                className="team-content"
                onClick={this.onClickTeam.bind(this)}
              >
                <div className="logo-container float-left">
                  <div className="cell">
                    <div
                      className="logo"
                      style={{
                        backgroundImage:
                          "url(" +
                          (this.props.team.pictureUrl
                            ? this.props.team.pictureUrl
                            : "") +
                          ")"
                      }}
                    >
                      {this.props.team.pictureUrl === undefined
                        ? this.props.team.name.charAt(0).toUpperCase()
                        : ""}
                    </div>
                  </div>
                </div>
                <div className="float-left">
                  <div className="team-name">{this.props.team.name}</div>
                  <div className="team-players">
                    {(this.props.team.players === undefined
                      ? 0
                      : this.props.team.players.length) + " giocatori"}{" "}
                  </div>
                </div>
                <div className="float-right">
                  <div>
                    <FontAwesomeIcon icon="trophy" className="trophy-icon" />
                  </div>
                  <div className="win-number">{this.props.team.win}</div>
                </div>
                <div className="clear" />
              </div>
            </CardContent>
          </CardActionArea>
        </Card>
      </Grow>
    );
  }
}

TeamCard.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(TeamCard);
