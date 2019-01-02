import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';

const styles = {
    card: {
        minWidth: 275,
    },
    bullet: {
        display: 'inline-block',
        margin: '0 2px',
        transform: 'scale(0.8)',
    },
    title: {
        fontSize: 14,
    },
    pos: {
        marginBottom: 12,
    },
};

function Game(props) {
    const { classes } = props;

    function openGame() {
        console.log("open game " + props.game.id);
    }

    return (
        <Card className={classes.card + " game-card"}>
            <CardContent>
                <div className="game-content" onClick={openGame}>
                    <div className={"float-left side-text live-text" + (props.game.live ? 'live' : '')}>{props.game.live ? 'Live' : 'Punteggio finale'}</div>
                    <div className="float-right side-text">{props.game.date !== undefined ? props.game.date.day : ""}</div>
                    <div className="clear">
                        <div className={"float-left relevant-text" + (props.game.resultA > props.game.resultB ? 'winner' : "")}>{props.game.teamA}</div>
                        <div className={"float-right relevant-text" + (props.game.resultA > props.game.resultB ? "winner" : "")}>{props.game.resultA}</div>
                    </div>
                    <div className="clear">
                        <div className={"float-left relevant-text" + (props.game.resultB > props.game.resultA ? "winner" : "")}>{props.game.teamB}</div>
                        <div className={"float-right relevant-text" + (props.game.resultB > props.game.resultA ? "winner" : "")}>{props.game.resultB}</div>
                    </div>
                    <div className="clear side-text">{props.game.location.name}</div>
                </div>
            </CardContent>
        </Card>
    );
}

Game.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  
  export default withStyles(styles)(Game);
