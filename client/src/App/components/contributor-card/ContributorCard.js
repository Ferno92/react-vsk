import React from "react";
import {
  Card,
  CardContent,
  IconButton
} from "@material-ui/core";
import "./ContributorCard.scss";
import { Done, Clear } from "@material-ui/icons";

class ContributorCard extends React.Component {
  render() {
    return (
      <Card>
        <CardContent className="contributor-content">
          <div
            className="contributor-image"
            style={{ backgroundImage: "url(" + this.props.image + ")" }}
          />
          <div>
            <div className="contributor-name">{this.props.name}</div>
            {/*<div className="contributor-email">{this.props.email}</div>*/}
          </div>
          <div>
          {this.props.isAsking && (
            <IconButton onClick={this.props.acceptContributor}>
              <Done />
            </IconButton>
          )}

          <IconButton onClick={this.props.removeContributor}>
            <Clear />
          </IconButton>
          </div>
        </CardContent>
      </Card>
    );
  }
}

export default ContributorCard;
