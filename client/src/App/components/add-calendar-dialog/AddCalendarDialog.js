import React from "react";
import {
  Dialog,
  AppBar,
  Slide,
  Toolbar,
  IconButton,
  Typography,
  List,
  ListItem,
  Divider,
  TextField,
  Button
} from "@material-ui/core";
import { Close } from "@material-ui/icons";
import IntegrationReactSelect from "../../components/autocompleteInputs/AutocompleteInputs";
import {
  MuiPickersUtilsProvider,
  TimePicker,
  DatePicker
} from "material-ui-pickers";
import DateFnsUtils from "@date-io/date-fns";
import ItLocale from "date-fns/locale/it";
import "./AddCalendarDialog.scss";

function Transition(props) {
  return <Slide direction="up" {...props} />;
}

class AddCalendarDialog extends React.Component {
  state = {
    where: "",
    date: new Date(),
    opponents: ""
  };

  handleChangeWhere = event => {
    this.setState({ where: event.target.value });
  };

  handleDateChange = date => {
    console.log(date);
    this.setState({ date: date });
  };

  addOnCalendar = () => {
    const {addOnCalendar} = this.props;
    const {date, where, opponents} = this.state;
    addOnCalendar(date, where, opponents);
  }

  onChangeOpponent = (text) => {
    this.setState({opponents: text});
  }

  render() {
    const { open, onClose, teamName } = this.props;
    const { where, date } = this.state;
    return (
      <Dialog
        fullScreen
        open={open}
        onClose={onClose}
        TransitionComponent={Transition}
      >
        <AppBar position="fixed" color="secondary">
          <Toolbar>
            <IconButton color="inherit" onClick={onClose} aria-label="Close">
              <Close />
            </IconButton>
            <Typography variant="h6" color="inherit" style={{ flex: 1 }}>
              Crea partita a calendario
            </Typography>
            <Button onClick={this.addOnCalendar}>Aggiungi</Button>
          </Toolbar>
        </AppBar>
        <div style={{ padding: "50px" }}>
          <List>
            <ListItem>
              <IntegrationReactSelect label="Team A" teamName={teamName} />
            </ListItem>
            <Divider />
            <ListItem>
              <IntegrationReactSelect label="Team B" onChangeText={this.onChangeOpponent}/>
            </ListItem>
            <Divider />
            <ListItem>
              <TextField
                label="Dove"
                onChange={this.handleChangeWhere}
                value={where}
                variant="outlined"
                fullWidth
                margin="normal"
              />
            </ListItem>
            <Divider />
            <ListItem className="date-list-item">
              <div>
                <MuiPickersUtilsProvider utils={DateFnsUtils} locale={ItLocale}>
                  <DatePicker
                    margin="normal"
                    label="Scegli la data"
                    value={date}
                    onChange={this.handleDateChange}
                  />
                </MuiPickersUtilsProvider>
              </div>
              <div>
                <MuiPickersUtilsProvider utils={DateFnsUtils} locale={ItLocale}>
                  <TimePicker
                    margin="normal"
                    label="Scegli l'orario"
                    value={date}
                    onChange={this.handleDateChange}
                    ampm={false}
                  />
                </MuiPickersUtilsProvider>
              </div>
            </ListItem>
          </List>
        </div>
      </Dialog>
    );
  }
}

export default AddCalendarDialog;
