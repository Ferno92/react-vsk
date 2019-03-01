import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import ListItem from "@material-ui/core/ListItem";
import List from "@material-ui/core/List";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import CloseIcon from "@material-ui/icons/Close";
import Slide from "@material-ui/core/Slide";
import store from "../../store/store.js";
import { showCreateTeam, showMessageAction } from "../../actions/actions";
import { TextField } from "@material-ui/core";

const styles = {
  appBar: {
    position: "relative",
    background: "#000"
  },
  flex: {
    flex: 1
  }
};

function Transition(props) {
  return <Slide direction="up" {...props} />;
}

class CreateTeam extends React.Component {
  constructor(){
    super();
    this.state = {
      teamName: ''
    }
  }
  handleClose = () => {
    store.dispatch(showCreateTeam(false));
  };

  handleSave = () => {
    const {teamName} = this.state;
    if(teamName.trim() === ""){
      store.dispatch(showMessageAction("error", "Errore: campi mancanti o non corretti"));
    }else{
      this.props.save(teamName);
    }
    // if(store.getState().createMatch.teamA.trim() !== "" && store.getState().createMatch.teamB.trim() !== ""){
    //   store.dispatch(showCreateMatch(false));
    //   store.dispatch(updateCreateMatch("save", true));
    // }else{
    //   //toast
    // store.dispatch(showMessageAction("error", "Errore: campi mancanti o non corretti"));
    // }
  };

  handleChange = (event) =>{
    this.setState({teamName: event.currentTarget.value})
  }

  render() {
    const { classes } = this.props;
    const {teamName} = this.state;
    return (
      <div>
        <Dialog
          fullScreen
          open={this.props.open}
          onClose={this.handleClose}
          TransitionComponent={Transition}
        >
          <AppBar className={classes.appBar}>
            <Toolbar>
              <IconButton
                color="inherit"
                onClick={this.handleClose}
                aria-label="Close"
              >
                <CloseIcon />
              </IconButton>
              <Typography variant="h6" color="inherit" className={classes.flex}>
                Crea Nuova Squadra
              </Typography>
              <Button color="inherit" onClick={this.handleSave}>
                Salva
              </Button>
            </Toolbar>
          </AppBar>
          <List>
            <ListItem>
               <TextField
                id="outlined"
                label="Nome Squadra"
                margin="normal"
                variant="outlined"
                style={{width: "100%"}}
                value={teamName}
                onChange={this.handleChange.bind(this)}
              /> 

            </ListItem>
          </List>
        </Dialog>
      </div>
    );
  }
}

CreateTeam.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(CreateTeam);
