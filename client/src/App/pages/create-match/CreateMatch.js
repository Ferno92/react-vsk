import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import ListItem from '@material-ui/core/ListItem';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import CloseIcon from '@material-ui/icons/Close';
import Slide from '@material-ui/core/Slide';
import TextField from '@material-ui/core/TextField';
import store from "../../store/index.js";
import { showCreateMatch } from "../../actions";
import {connect} from "react-redux";

const styles = {
  appBar: {
    position: 'relative',
    background: "#000"
  },
  flex: {
    flex: 1,
  },
};

const mapStateToProps = state => {
  return {
    open: state.dashboard.createMatchOpen
  }
}

function Transition(props) {
  return <Slide direction="up" {...props} />;
}

class FullScreenDialog extends React.Component {

  handleClose = () => {
    store.dispatch(showCreateMatch(false));
  };

  render() {
    const { classes } = this.props;
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
              <IconButton color="inherit" onClick={this.handleClose} aria-label="Close">
                <CloseIcon />
              </IconButton>
              <Typography variant="h6" color="inherit" className={classes.flex}>
                Crea Partita
              </Typography>
              <Button color="inherit" onClick={this.handleClose}>
                Salva
              </Button>
            </Toolbar>
          </AppBar>
          <List>
            <ListItem>
              <TextField
                required
                id="outlined"
                label="Team A"
                margin="normal"
                variant="outlined"
              />
            </ListItem>
            <Divider />
            <ListItem>
              <TextField
                required
                id="outlined"
                label="Team B"
                margin="normal"
                variant="outlined"
              />
            </ListItem>
          </List>
        </Dialog>
      </div>
    );
  }
}

FullScreenDialog.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(connect(mapStateToProps)(FullScreenDialog));
