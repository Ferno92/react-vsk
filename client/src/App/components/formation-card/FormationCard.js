import React from "react";
import { Card, CardActionArea, CardContent, Avatar, Chip } from "@material-ui/core";
import "./FormationCard.scss";

class FormationCard extends React.Component {
  render() {
    return (
      <Card className="formation-card">
        <CardActionArea onClick={this.props.addFormation.bind(this, this.props.formation)}>
          <CardContent className="card-content">
            <div className="formation-name">{this.props.formation.name}</div>
            <div className="court-container">
              <div className="court-line" />
              {this.props.formation.players.map((item, pIndex) => {
                var player = { id: "", number: "" };
                for (var i = 0; i < this.props.players.length; i++) {
                  if (this.props.players[i].id === item.id) {
                    player = this.props.players[i];
                  }
                }
                return (
                  <Avatar
                    key={player.id}
                    className={"avatar avatar-" + item.position}
                  >
                    {player.number}
                  </Avatar>
                );
              })}
            </div>
            <div>
              {this.props.formation.players.map((item, pIndex) => {
                var player = { id: "", number: "", name: "" };
                for (var i = 0; i < this.props.players.length; i++) {
                  if (this.props.players[i].id === item.id) {
                    player = this.props.players[i];
                  }
                }
                return (
                  <Chip
                    className="chip"
                    key={player.id}
                    label={player.name}
                    avatar={<Avatar>{player.number}</Avatar>}
                  />
                );
              })}
            </div>
          </CardContent>
        </CardActionArea>
      </Card>
    );
  }
}

export default FormationCard;
