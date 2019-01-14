import React from "react";
import Button from "@material-ui/core/Button";
import "./ResultButton.scss";

class ResultButton extends React.Component {
    
	render() {
		return (
			<div className="result-button-container">
            <Button
              variant="contained"
              color="primary"
              className="button-half top"
              onClick={this.props.add}
              disabled={this.props.disabled || this.props.spectator}
            >
              {this.props.disabled || this.props.spectator ? "" : "+"}
            </Button>
            <div className={"result " + (this.props.disabled || this.props.spectator ? "final" : "")}>
              {this.props.result}
            </div>
            <Button
              variant="contained"
              color="primary"
              className="button-half bottom"
              onClick={this.props.remove}
              disabled={this.props.disabled || this.props.spectator}
            >
            {this.props.disabled || this.props.spectator ? "" : "-"}
            </Button>
            </div>
		);
	}
}

export default ResultButton;