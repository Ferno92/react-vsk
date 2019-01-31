import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import {
  Tabs,
  Tab,
  Button,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Menu,
  MenuItem,
  Badge
} from "@material-ui/core";
import ArrowBack from "@material-ui/icons/ArrowBack";
import Delete from "@material-ui/icons/Delete";
import Share from "@material-ui/icons/Share";
import SwipeableViews from "react-swipeable-views";
import store from "../../store/store";
import { updateAppbar, updateCreateMatch } from "../../actions/actions";
import firebase from "firebase/app";
import "firebase/database";
import ls from "local-storage";
import { firebaseConfig } from "../../App";
import "./Match.scss";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import MatchInfo from "../match-info/MatchInfo";
import Chat from "../chat/Chat";

const styles = theme => ({
  header: {
    backgroundColor: theme.palette.background.paper
  },
  appBar: {
    top: "auto",
    bottom: 0
  },
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper
  },
  grow: {
    flexGrow: 1
  },
  subHeader: {
    backgroundColor: theme.palette.background.paper
  },
  buttonBase: {
    backgroundColor: theme.palette.primary.main
  }
});

function TabContainer({ children, dir }) {
  return (
    <Typography component="div" dir={dir} style={{ padding: 8 * 3 }}>
      {children}
    </Typography>
  );
}

TabContainer.propTypes = {
  children: PropTypes.node.isRequired,
  dir: PropTypes.string.isRequired
};

class Match extends React.Component {
  state = {
    value: 0,
    currentGame: null,
    confirmDialogOpen: false,
    spectator: false,
    anchorEl: null,
    chatBadge: 0
  };
  gameRef = null;

  componentDidMount() {
    store.dispatch(updateCreateMatch("save", false));
    store.dispatch(updateAppbar("visible", false));
    var user = ls.get("user");
    var userId = "";
    if (
      user !== null &&
      (this.props.match.params.owner === undefined ||
        this.props.match.params.owner === user.id)
    ) {
      userId = user.id;
    } else {
      userId = this.props.match.params.owner;
      this.setState({ ...this.state, spectator: true });
    }
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }

    this.db = firebase.app().database();

    this.gameRef = this.db.ref(
      "users/" + userId + "/games/" + this.props.match.params.id
    );
    this.gameRef.on("value", snapshot => {
      this.setState(prevState => ({
        ...prevState,
        currentGame: snapshot.val()
      }));
      console.log("game from db", this.state.currentGame);
    });
  }

  componentWillUnmount() {
    this.gameRef.off("value");
  }

  handleChange = (event, value) => {
    this.setState(prevState => ({
      ...prevState,
      value: value
    }));
  };

  onBack() {
    if (window.history.length > 0) {
      window.history.back();
    } else {
      this.props.history.push("/");
    }
  }

  deleteGame() {
    this.setState({ ...this.state, confirmDialogOpen: true });
  }

  handleCloseConfirmDialog(toDelete) {
    if (toDelete) {
      this.gameRef.remove();
      this.props.history.push("/");
    }
    this.setState({ ...this.state, confirmDialogOpen: false, anchorEl: null });
  }

  handleClickMenu = event => {
    this.setState({ ...this.state, anchorEl: event.currentTarget });
  };

  handleCloseMenu = () => {
    this.setState({ ...this.state, anchorEl: null });
  };

  share() {
    var url = window.location.origin;
    if (this.state.spectator) {
      // same url
      url += this.props.match.url;
    } else {
      url += this.props.match.url + "/" + ls.get("user").id;
    }
    var newVariable = window.navigator;
    if (newVariable && newVariable.share) {
      newVariable
        .share({
          title:
            this.state.currentGame.teamA +
            " vs " +
            this.state.currentGame.teamB,
          text: "Segui la partita in diretta: ",
          url: url
        })
        .then(() => console.log("Successful share"))
        .catch(error => console.log("Error sharing", error));
    } else {
      alert("share not supported for: " + url);
    }
  }

  handleChangeIndex = (index, indexLatest, meta) => {
    var badge = this.state.chatBadge;
    if (index === 2) {
      badge = 0;
    }
    this.setState(prevState => ({
      ...prevState,
      value: index,
      chatBadge: badge
    }));
  };

  onReceiveMessage = () => {
    if (this.state.value !== 2) {
      this.setState({ ...this.state, chatBadge: this.state.chatBadge + 1 });
    }
  };

  onClickTab = tab => {
    switch (tab) {
      case "chat":
        this.setState(prevState => ({
          ...prevState,
          chatBadge: 0
        }));
        break;
      default:
        break;
    }
  };

  render() {
    const { classes, theme } = this.props;
    const { anchorEl } = this.state;
    const openMenu = Boolean(anchorEl);

    return (
      <div className={classes.root}>
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
              {this.state.currentGame
                ? this.state.currentGame.teamA +
                  " vs " +
                  this.state.currentGame.teamB
                : ""}
            </Typography>
            <IconButton
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
            </Menu>
          </Toolbar>
          <Tabs
            value={this.state.value}
            onChange={this.handleChange}
            indicatorColor="secondary"
            textColor="secondary"
            centered
          >
            <Tab
              label="Punteggio"
              style={this.state.value !== 0 ? { color: "#808080" } : {}}
            />
            <Tab
              label="Formazione"
              style={this.state.value !== 1 ? { color: "#808080" } : {}}
            />
            <Tab
              label={
                this.state.chatBadge > 0 ? (
                  <Badge
                    color="secondary"
                    badgeContent={this.state.chatBadge}
                    className="badge"
                  >
                    Chat
                  </Badge>
                ) : (
                  "Chat"
                )
              }
              onClick={this.onClickTab.bind(this, "chat")}
              style={this.state.value !== 2 ? { color: "#808080" } : {}}
            />
          </Tabs>
        </AppBar>
        <SwipeableViews
          axis={theme.direction === "rtl" ? "x-reverse" : "x"}
          index={this.state.value}
          onChangeIndex={this.handleChangeIndex}
          className="tab-container"
        >
          <TabContainer dir={theme.direction}>
            <MatchInfo
              currentGame={this.state.currentGame}
              spectator={this.state.spectator}
              gameRef={this.gameRef}
            />
          </TabContainer>
          <TabContainer dir={theme.direction}>Item Two</TabContainer>
          <TabContainer dir={theme.direction}>
            <Chat
              currentGame={this.state.currentGame}
              gameRef={this.gameRef}
              spectator={this.state.spectator}
              isVisible={this.state.value === 2}
              ownerId={this.props.match.params.owner}
              onReceiveMessage={this.onReceiveMessage.bind(this)}
            />
          </TabContainer>
        </SwipeableViews>
        <Dialog
          open={this.state.confirmDialogOpen}
          onClose={this.handleCloseConfirmDialog.bind(this, false)}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">{"Elimina partita"}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Sei sicuro di voler eliminare la partita?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={this.handleCloseConfirmDialog.bind(this, false)}
              color="primary"
            >
              No
            </Button>
            <Button
              onClick={this.handleCloseConfirmDialog.bind(this, true)}
              color="primary"
              autoFocus
            >
              Si
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

Match.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles, { withTheme: true })(Match);
