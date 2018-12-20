import React, { Fragment } from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import Fab from "@material-ui/core/Fab";
import MenuIcon from "@material-ui/icons/Menu";
import AddIcon from "@material-ui/icons/Add";
import SearchIcon from "@material-ui/icons/Search";
import MoreIcon from "@material-ui/icons/MoreVert";
import SwipeableDrawer from "@material-ui/core/SwipeableDrawer";
import List from "@material-ui/core/List";
import Divider from "@material-ui/core/Divider";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import { Home, Group, Flag, ExitToApp } from "@material-ui/icons";
import { Link } from "react-router-dom";

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
  }
});

class BottomAppBar extends React.Component {
  state = {
    bottom: false
  };

  toggleDrawer = open => () => {
    this.setState({
      bottom: open
    });
  };

  render() {
    const { classes } = this.props;

    const fullList = (
      <div className={classes.fullList}>
        <List>
          <ListItem button key={"Luca Fernandez"}>
            <ListItemText primary={"Luca Fernandez"} />
          </ListItem>
        </List>
        <Divider />
        <List>
          <ListItem button key={"Homepage"} component={Link} to='/'>
            <ListItemIcon>
              <Home />
            </ListItemIcon>
            <ListItemText primary={"Homepage"} />
          </ListItem>

          <ListItem button key={"Teams"}  component={Link} to='/login'>
            <ListItemIcon>
              <Group />
            </ListItemIcon>
            <ListItemText primary={"Le tue squadre"} />
          </ListItem>

          <ListItem button key={"Flag"}>
            <ListItemIcon>
              <Flag />
            </ListItemIcon>
            <ListItemText primary={"Partite in corso"} />
          </ListItem>

          <ListItem button key={"Logout"}>
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
          <SwipeableDrawer
            anchor="bottom"
            open={this.state.bottom}
            onClose={this.toggleDrawer(false)}
            onOpen={this.toggleDrawer(true)}
          >
            <div
              tabIndex={0}
              role="button"
              onClick={this.toggleDrawer(false)}
              onKeyDown={this.toggleDrawer(false)}
            >
              {fullList}
            </div>
          </SwipeableDrawer>
          <AppBar position="fixed" color="primary" className={classes.appBar}>
            <Toolbar className={classes.toolbar}>
              <IconButton
                color="inherit"
                aria-label="Open drawer"
                onClick={this.toggleDrawer(true)}
              >
                <MenuIcon />
              </IconButton>
              <Fab
                color="secondary"
                aria-label="Add"
                className={classes.fabButton}
              >
                <AddIcon />
              </Fab>
              <div>
                <IconButton color="inherit">
                  <SearchIcon />
                </IconButton>
                <IconButton color="inherit">
                  <MoreIcon />
                </IconButton>
              </div>
            </Toolbar>
          </AppBar>
          </div> 
    );
  }
}

BottomAppBar.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(BottomAppBar);
