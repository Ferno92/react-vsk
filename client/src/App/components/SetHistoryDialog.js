import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import blue from '@material-ui/core/colors/blue';

const styles = {
  avatar: {
    backgroundColor: blue[100],
    color: blue[600],
  },
};

class SimpleDialog extends React.Component {
  handleClose = () => {
    this.props.onClose();
  };

  render() {
    const { classes, onClose, selectedValue, ...other } = this.props;
    var countA = 0;
    var countB = 0;
    return (
      <Dialog onClose={this.handleClose} aria-labelledby="simple-dialog-title" {...other}>
        <DialogTitle id="simple-dialog-title">History:</DialogTitle>
        <div>
          <List>
            {this.props.history.map((item,index) =>{
                    if(item.a === "x"){
                        countA++;
                    }else{
                        countB++;
                    }
                    return (
                        <ListItem key={index} style={{textAlign: "center"}}>
                          <ListItemText primary={countA + " - "  + countB} />
                        </ListItem>
                      )
            })}
          </List>
        </div>
      </Dialog>
    );
  }
}

SimpleDialog.propTypes = {
  classes: PropTypes.object.isRequired,
  onClose: PropTypes.func,
  selectedValue: PropTypes.string,
};

const SimpleDialogWrapped = withStyles(styles)(SimpleDialog);

class SetHistoryDialog extends React.Component {
  state = {
    open: false, 
    history: []
  };
  handleClose = () => {
    this.setState({open: false, 
        history: [] });
        this.props.close();
  };

  render() {
    return (
      <div>
        <SimpleDialogWrapped
          open={this.props.open}
          onClose={this.handleClose}
          history={this.props.history}
        />
      </div>
    );
  }
}

export default SetHistoryDialog;
