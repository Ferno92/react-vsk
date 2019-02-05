import React from "react";
import {Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button} from "@material-ui/core";
import store from "../../store/store";

class YesNoDialog extends React.Component{
    render(){
        return (<Dialog
            open={this.props.open}
            onClose={this.toggleLogoutDialog}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title">{"Logout"}</DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                {this.props.dialogText}
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={this.props.noAction} color="primary">
                No
              </Button>
              <Button onClick={this.props.yesAction} color="primary" autoFocus>
                Si
              </Button>
            </DialogActions>
          </Dialog>);
    }
}

export default YesNoDialog;