import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';
import InfoIcon from '@material-ui/icons/Info';
import CloseIcon from '@material-ui/icons/Close';
import green from '@material-ui/core/colors/green';
import amber from '@material-ui/core/colors/amber';
import IconButton from '@material-ui/core/IconButton';
import Snackbar from '@material-ui/core/Snackbar';
import SnackbarContent from '@material-ui/core/SnackbarContent';
import WarningIcon from '@material-ui/icons/Warning';
import { withStyles } from '@material-ui/core/styles';
import store from "../store/store";
import { resetMessages } from '../actions/actions';

const variantIcon = {
  success: CheckCircleIcon,
  warning: WarningIcon,
  error: ErrorIcon,
  info: InfoIcon,
};

const styles1 = theme => ({
  success: {
    backgroundColor: green[600],
  },
  error: {
    backgroundColor: theme.palette.error.dark,
  },
  info: {
    backgroundColor: theme.palette.primary.dark,
  },
  warning: {
    backgroundColor: amber[700],
  },
  icon: {
    fontSize: 20,
  },
  iconVariant: {
    opacity: 0.9,
    marginRight: theme.spacing.unit,
  },
  message: {
    display: 'flex',
    alignItems: 'center',
  },
});

function Messages(props) {
  const { classes, className, message, onClose, variant, ...other } = props;
  const Icon = variantIcon[variant];

  return (
    <SnackbarContent
      className={classNames(classes[variant], className)}
      aria-describedby="client-snackbar"
      message={
        <span id="client-snackbar" className={classes.message}>
          <Icon className={classNames(classes.icon, classes.iconVariant)} />
          {message}
        </span>
      }
      action={[
        <IconButton
          key="close"
          aria-label="Close"
          color="inherit"
          className={classes.close}
          onClick={onClose}
        >
          <CloseIcon className={classes.icon} />
        </IconButton>,
      ]}
      {...other}
    />
  );
}

Messages.propTypes = {
  classes: PropTypes.object.isRequired,
  className: PropTypes.string,
  message: PropTypes.node,
  onClose: PropTypes.func,
  variant: PropTypes.oneOf(['success', 'warning', 'error', 'info']).isRequired,
};

const MessagesWrapper = withStyles(styles1)(Messages);

class CustomizedSnackbars extends React.Component {
  state = {
    open: false,
    message: "",
    type: "success"
  };
  storeUnsubscribe = null;

  constructor(){
    super();
    console.log("message constructor");
    
    this.storeUnsubscribe = store.subscribe(this.messageSubscriber.bind(this));
  }

  componentDidMount(){
    this.messageSubscriber();
  }

  componentWillUnmount(){
    
    if (this.storeUnsubscribe !== null) {
      this.storeUnsubscribe();
    }
  }

  messageSubscriber(){
      if(store.getState().message.on){
        this.showMessage(store.getState().message.type, store.getState().message.text);
      }
  }

  showMessage = (type, message) => {
    this.setState({
      open: true,
      message: message,
      type: type
    });
  };

  handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    var self = this;
    setTimeout(function(){
      self.setState({
        open: false,
        message: "",
        type: "success"
      });
    }, 200);

    store.dispatch(resetMessages());
    this.setState({
      open: false,
      message: this.state.message,
      type: this.state.type
    });
  };

  render() {
    return (
      <div>
        <Snackbar
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
          open={this.state.open}
          autoHideDuration={3000}
          onClose={this.handleClose}
        >
          <MessagesWrapper
            onClose={this.handleClose}
            variant={this.state.type}
            message={this.state.message}
          />
        </Snackbar>
      </div>
    );
  }
}
;

export default (CustomizedSnackbars);
