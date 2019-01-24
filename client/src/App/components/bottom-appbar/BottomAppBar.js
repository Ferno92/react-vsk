import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import Fab from "@material-ui/core/Fab";
import MenuIcon from "@material-ui/icons/Menu";
import AddIcon from "@material-ui/icons/Add";
import Close from "@material-ui/icons/Close";
import SearchIcon from "@material-ui/icons/Search";
// import MoreIcon from "@material-ui/icons/MoreVert";
import SwipeableDrawer from "@material-ui/core/SwipeableDrawer";
import List from "@material-ui/core/List";
import Divider from "@material-ui/core/Divider";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import { Home, Group, Flag, ExitToApp } from "@material-ui/icons";
import { Link } from "react-router-dom";
import ls from "local-storage";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Button from "@material-ui/core/Button";
import store from "../../store/store.js";
import { updateAppbar, showCreateMatch } from "../../actions/actions";
import { connect } from "react-redux";
import Slide from "@material-ui/core/Slide";
import TextField from "@material-ui/core/TextField";
import "./BottomAppBar.scss";

const styles = theme => ({
  text: {
    paddingTop: theme.spacing.unit * 2,
    paddingLeft: theme.spacing.unit * 2,
    paddingRight: theme.spacing.unit * 2
  },
  paper: {
    paddingBottom: 50
  },
  list: {
    marginBottom: theme.spacing.unit * 2
  },
  subHeader: {
    backgroundColor: theme.palette.background.paper
  },
  appBar: {
    top: "auto",
    bottom: 0
  },
  toolbar: {
    alignItems: "center",
    justifyContent: "space-between"
  },
  fabButton: {
    position: "absolute",
    zIndex: 1,
    top: -30,
    left: 0,
    right: 0,
    margin: "0 auto"
  },
  inputRoot: {
    color: "inherit",
    width: "100%"
  },
  inputInput: {
    paddingTop: theme.spacing.unit,
    paddingRight: theme.spacing.unit,
    paddingBottom: theme.spacing.unit,
    paddingLeft: theme.spacing.unit * 10,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      width: 120,
      "&:focus": {
        width: 200
      }
    }
  },
  container: {
    display: "flex",
    flexWrap: "wrap"
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: 200
  },

  cssLabel: {
    color: "white"
  },

  cssOutlinedInput: {
    "&$cssFocused $notchedOutline": {
      borderColor: `${theme.palette.secondary.main} !important`
    }
  },

  cssFocused: {},

  notchedOutline: {
    borderWidth: "1px",
    borderColor: "white !important"
  }
});
const updateProps = () => {
  // console.log(store.getState());
};

const mapStateToProps = state => {
  // console.log("mapStateToProps", state);
  return {
    navigationMenuOpen: state.appBar.navigationMenuOpen,
    logoutDialogOpen: state.appBar.logoutDialogOpen,
    visible: state.appBar.visible,
    hideAppBar: !state.appBar.visible,
    fabVisible: state.appBar.fabVisible,
    search: state.appBar.search,
    inputSearch: state.appBar.inputSearch,
    loggedIn: state.loggedIn,
    searchButtonVisible: state.appBar.searchButtonVisible
  };
};

class BottomAppBar extends React.Component {
  componentDidMount() {
    store.subscribe(updateProps);
  }

  updateState = (type, value) => {
    // const currentState = this.state;
    // this.state[type] = value;
    // this.setState(currentState);
    store.dispatch(updateAppbar(type, value));
  };

  toggleDrawer = open => () => {
    this.updateState("navigationMenuOpen", open);
  };

  toggleLogoutDialog = () => {
    this.updateState(
      "logoutDialogOpen",
      !store.getState().appBar.logoutDialogOpen
    );
  };

  onClickFab = () => {
    store.dispatch(showCreateMatch(true));
  };

  logoutUser = () => {
    this.toggleLogoutDialog();
    this.props.logout();
  };

  openCloseSearch() {
    if (this.props.search) {
      //TODO remove text in input
      this.updateState("inputSearch", "");
    }
    this.updateState("search", !this.props.search);
  }

  handleSearchChange = event => {
    console.log(event.target.value);
    this.updateState("inputSearch", event.target.value);
  };

  render() {
    const { classes } = this.props;
    const notLoggedList = (
      <List>
        <ListItem
          button
          key={"Homepage"}
          component={Link}
          to="/"
          selected={window.location.pathname === "/"}
        >
          <ListItemIcon>
            <Home />
          </ListItemIcon>
          <ListItemText primary={"Homepage"} />
        </ListItem>

        <ListItem
          button
          key={"Login"}
          component={Link}
          to="/login"
          selected={window.location.pathname === "/login"}
        >
          <ListItemIcon>
            <Group />
          </ListItemIcon>
          <ListItemText primary={"Login"} />
        </ListItem>

        <ListItem
          button
          key={"Flag"}
          component={Link}
          to="/search"
          selected={window.location.pathname === "/search"}
        >
          <ListItemIcon>
            <Flag />
          </ListItemIcon>
          <ListItemText primary={"Partite in corso"} />
        </ListItem>
      </List>
    );
    const username = this.props.logged ? ls.get("user").name : "";
    const userPictureUrl = this.props.logged ? ls.get("user").imageUrl : "";

    const fullList = (
      <div className={classes.fullList}>
        <List>
          <ListItem button key={username}
          component={Link}
          to="/profile"
          selected={window.location.pathname === "/profile"}>
            <ListItemIcon>
              <img src={userPictureUrl} className="user-picture" />
            </ListItemIcon>
            <ListItemText primary={username} />
          </ListItem>
        </List>
        <Divider />
        <List>
          <ListItem
            button
            key={"Homepage"}
            component={Link}
            to="/"
            selected={window.location.pathname === "/"}
          >
            <ListItemIcon>
              <Home />
            </ListItemIcon>
            <ListItemText primary={"Homepage"} />
          </ListItem>

          <ListItem button key={"Teams"}>
            <ListItemIcon>
              <Group />
            </ListItemIcon>
            <ListItemText primary={"Le tue squadre"} />
          </ListItem>

          <ListItem
            button
            key={"Flag"}
            component={Link}
            to="/search"
            selected={window.location.pathname === "/search"}
          >
            <ListItemIcon>
              <Flag />
            </ListItemIcon>
            <ListItemText primary={"Partite in corso"} />
          </ListItem>

          <ListItem button key={"Logout"} onClick={this.toggleLogoutDialog}>
            <ListItemIcon>
              <ExitToApp />
            </ListItemIcon>
            <ListItemText primary={"Esci"} />
          </ListItem>
        </List>
      </div>
    );
    return (
      <div>
        {/* navigation menu */}
        <SwipeableDrawer
          anchor="bottom"
          open={this.props.navigationMenuOpen}
          onClose={this.toggleDrawer(false)}
          onOpen={this.toggleDrawer(true)}
        >
          <div
            tabIndex={0}
            role="button"
            onClick={this.toggleDrawer(false)}
            onKeyDown={this.toggleDrawer(false)}
          >
            {this.props.logged ? fullList : notLoggedList}
          </div>
        </SwipeableDrawer>

        {/* logout dialog */}
        <Dialog
          open={store.getState().appBar.logoutDialogOpen}
          onClose={this.toggleLogoutDialog}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">{"Logout"}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Sei sicuro di voler effettuare il logout?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.toggleLogoutDialog} color="primary">
              No
            </Button>
            <Button onClick={this.logoutUser} color="primary" autoFocus>
              Si
            </Button>
          </DialogActions>
        </Dialog>

        {/* bottom app bar */}
        <Slide
          direction="up"
          in={!this.props.hideAppBar}
          mountOnEnter
          unmountOnExit
        >
          <AppBar position="fixed" color="primary" className={classes.appBar}>
            <Toolbar className={classes.toolbar}>
              <IconButton
                color="inherit"
                aria-label="Open drawer"
                onClick={this.toggleDrawer(true)}
              >
                <MenuIcon />
              </IconButton>
              {this.props.fabVisible && this.props.loggedIn && (
                <Fab
                  color="secondary"
                  aria-label="Add"
                  className={classes.fabButton}
                  onClick={this.onClickFab}
                >
                  <AddIcon />
                </Fab>
              )}
              <TextField
                id="outlined-search"
                type="search"
                margin="normal"
                color="primary"
                variant="outlined"
                className={
                  "search-input " +
                  (this.props.search ? "search-open" : "search-close")
                }
                onChange={this.handleSearchChange}
                InputLabelProps={{
                  classes: {
                    root: classes.cssLabel,
                    focused: classes.cssFocused
                  }
                }}
                InputProps={{
                  classes: {
                    root: classes.cssOutlinedInput,
                    focused: classes.cssFocused,
                    notchedOutline: classes.notchedOutline
                  },
                  inputMode: "numeric"
                }}
              />
              <div>
                {!this.props.fabVisible && this.props.searchButtonVisible && (
                  <IconButton
                    color="inherit"
                    onClick={this.openCloseSearch.bind(this)}
                  >
                    {this.props.search ? <Close /> : <SearchIcon />}
                  </IconButton>
                )}

                {/* <IconButton color="inherit">
                  <MoreIcon />
                </IconButton> */}
              </div>
            </Toolbar>
          </AppBar>
        </Slide>
      </div>
    );
  }
}

BottomAppBar.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(connect(mapStateToProps)(BottomAppBar));
