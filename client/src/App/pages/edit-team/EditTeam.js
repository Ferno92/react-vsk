import React from "react";
import ArrowBack from "@material-ui/icons/ArrowBack";
import { Toolbar, IconButton, AppBar, Typography } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import store from "../../store/store";
import { updateAppbar, updateCreateMatch } from "../../actions/actions";
import firebase from "firebase/app";
import "firebase/database";
import { firebaseConfig } from "../../App";
import ls from "local-storage";

const styles = theme => ({
  grow: {
    flexGrow: 1
  }
});

class EditTeam extends React.Component {
  state = {
    team: null
  };
  teamRef = null;

  componentDidMount() {
    store.dispatch(updateCreateMatch("save", false));
    store.dispatch(updateAppbar("visible", false));
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }

    this.db = firebase.app().database();

    this.teamRef = this.db.ref(
      "users/" + ls.get("user").id + "/teams/" + this.props.match.params.id
    );
    var self = this;
    this.teamRef.on("value", snapshot => {
        console.log("team", snapshot.val());
        self.setState({...self.state, team: snapshot.val()});
    })
  }

  componentWillUnmount(){
      if(this.teamRef !== null){
          this.teamRef.off("value");
      }
  }

  onBack() {
    if (window.history.length > 0) {
      window.history.back();
    } else {
      this.props.history.push("/");
    }
  }

  render() {
    const { classes, theme } = this.props;
    return (
      <AppBar position="fixed" color="primary">
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="Menu"
            onClick={this.onBack.bind(this)}
          >
            <ArrowBack />
          </IconButton>
          <Typography
            variant="h6"
            color="inherit"
            className={classes.grow + " title-ellipsis"}
          >
            {this.state.team ? this.state.team.name : ""}
          </Typography>
          {/* <IconButton
            color="inherit"
            aria-label="Menu"
            onClick={this.handleClickMenu.bind(this)}
          >
            <MoreVertIcon />
          </IconButton>
          <Menu
            id="long-menu"
            anchorEl={anchorEl}
            open={openMenu}
            onClose={this.handleCloseMenu}
            style={{ marginTop: "40px" }}
          >
            {!this.state.spectator && (
              <MenuItem
                key={"deleteGame"}
                onClick={this.deleteGame.bind(this)}
              >
                <Delete />
                Elimina
              </MenuItem>
            )}

            <MenuItem key={"shareGame"} onClick={this.share.bind(this)}>
              <Share />
              Condividi
            </MenuItem>
          </Menu> */}
        </Toolbar>
      </AppBar>
    );
  }
}

export default withStyles(styles, { withTheme: true })(EditTeam);
