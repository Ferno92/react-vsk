import React from "react";
import PropTypes from "prop-types";
import deburr from "lodash/deburr";
import keycode from "keycode";
import Downshift from "downshift";
import { withStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import Paper from "@material-ui/core/Paper";
import MenuItem from "@material-ui/core/MenuItem";
import store from "../../store/store.js";
import { updateCreateMatch } from "../../actions/actions";
import firebase from "firebase/app";
import "firebase/database";
import ls from "local-storage";
import { firebaseConfig } from "../../App";

function renderInput(inputProps, hasDefaultValue) {
  const { InputProps, classes, ref, ...other } = inputProps;
  return (
    <TextField
      id="outlined"
      label={InputProps.label}
      margin="normal"
      variant="outlined"
      style={{ width: "100%" }}
      InputProps={{
        inputRef: ref,
        classes: {
          root: classes.inputRoot,
          input: classes.inputInput
        },
        ...InputProps
      }}
      {...other}
      disabled={hasDefaultValue}
    />
  );
}

function renderSuggestion({
  suggestion,
  index,
  itemProps,
  highlightedIndex,
  selectedItem
}) {
  const isHighlighted = highlightedIndex === index;
  const isSelected = (selectedItem || "").indexOf(suggestion.label) > -1;

  return (
    <MenuItem
      {...itemProps}
      key={suggestion.label}
      selected={isHighlighted}
      component="div"
      style={{
        fontWeight: isSelected ? 500 : 400
      }}
    >
      {suggestion.label}
    </MenuItem>
  );
}
renderSuggestion.propTypes = {
  highlightedIndex: PropTypes.number,
  index: PropTypes.number,
  itemProps: PropTypes.object,
  selectedItem: PropTypes.string,
  suggestion: PropTypes.shape({ label: PropTypes.string }).isRequired
};

function getSuggestions(value, suggestions) {
  const inputValue = deburr(value.trim()).toLowerCase();
  const inputLength = inputValue.length;
  let count = 0;

  return inputLength === 0
    ? []
    : suggestions.filter(suggestion => {
        const keep =
          count < 5 &&
          suggestion.label.slice(0, inputLength).toLowerCase() === inputValue;

        if (keep) {
          count += 1;
        }

        return keep;
      });
}

class DownshiftMultiple extends React.Component {
  state = {
    inputValue: undefined,
    selectedItem: [],
    suggestions: []
  };
  usersRef = null;

  componentDidMount() {
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    var self = this;
    this.db = firebase.app().database();
    this.usersRef = this.db.ref("/users");
    this.usersRef.on("value", snapshot => {
      var allTeams = [];
      for (var item in snapshot.val()) {
        var user = snapshot.val()[item];
        for (var team in user.teams) {
          var teamInfo = user.teams[team];
          if (
            item === ls.get("user").id ||
            (teamInfo.contributors &&
              teamInfo.contributors.accepted &&
              teamInfo.contributors.accepted.indexOf(ls.get("user").id) >= 0)
          ) {
            teamInfo.owner = {
              displayName: user.displayName,
              pictureUrl: user.pictureUrl,
              id: item
            };
            teamInfo.key = team;
            allTeams.push({label: teamInfo.name});
          }
        }
      }
      
      self.setState({ ...self.state, suggestions: allTeams });
    });
  }

  componentWillUnmount() {
    if (this.usersRef !== null) {
      this.usersRef.off("value");
    }
  }

  handleKeyDown = event => {
    const { inputValue, selectedItem } = this.state;
    if (
      selectedItem.length &&
      !inputValue.length &&
      keycode(event) === "backspace"
    ) {
      this.setState({
        selectedItem: selectedItem.slice(0, selectedItem.length - 1)
      });
    }
  };

  handleInputChange = event => {
    this.setState({ inputValue: event.target.value });
    const {onChangeText} = this.props;
    if(onChangeText){
      onChangeText(event.target.value);
    }else{
      store.dispatch(
        updateCreateMatch(
          this.props.label === "Team A" ? "teamA" : "teamB",
          event.target.value
        )
      );
    }
  };

  handleChange = item => {
    let { selectedItem } = this.state;

    if (selectedItem.indexOf(item) === -1) {
      selectedItem = [...selectedItem, item];
    }

    this.setState({
      inputValue: "",
      selectedItem
    });
    store.dispatch(
      updateCreateMatch(
        this.props.label === "Team A" ? "teamA" : "teamB",
        selectedItem[0]
      )
    );
  };

  handleDelete = item => () => {
    this.setState(state => {
      const selectedItem = [...state.selectedItem];
      selectedItem.splice(selectedItem.indexOf(item), 1);
      return { selectedItem };
    });
  };

  render() {
    const { classes, label, teamName } = this.props;
    const { inputValue, selectedItem } = this.state;

    return (
      <Downshift
        id="downshift-multiple"
        inputValue={inputValue}
        onChange={this.handleChange}
        selectedItem={selectedItem}
      >
        {({
          getInputProps,
          getItemProps,
          isOpen,
          inputValue: inputValue2,
          selectedItem: selectedItem2,
          highlightedIndex
        }) => (
          <div className={classes.container}>
            {renderInput({
              classes,
              InputProps: getInputProps({
                onChange: this.handleInputChange,
                onKeyDown: this.handleKeyDown,
                label: label,
                value: teamName ? teamName : selectedItem[0]
                // placeholder: 'Select multiple countries',
              })
            }, teamName ? true : false)}
            {isOpen ? (
              <Paper className={classes.paper} square>
                {getSuggestions(inputValue2, this.state.suggestions).map(
                  (suggestion, index) =>
                    renderSuggestion({
                      suggestion,
                      index,
                      itemProps: getItemProps({ item: suggestion.label }),
                      highlightedIndex,
                      selectedItem: selectedItem2
                    })
                )}
              </Paper>
            ) : null}
          </div>
        )}
      </Downshift>
    );
  }
}

DownshiftMultiple.propTypes = {
  classes: PropTypes.object.isRequired
};

const styles = theme => ({
  root: {
    flexGrow: 1
  },
  container: {
    flexGrow: 1,
    position: "relative"
  },
  paper: {
    position: "absolute",
    zIndex: 99,
    // marginTop: theme.spacing.unit,
    left: 0,
    right: 0
  },
  inputRoot: {
    flexWrap: "wrap"
  },
  inputInput: {
    width: "auto",
    flexGrow: 1
  },
  divider: {
    height: theme.spacing.unit * 2
  }
});

function IntegrationDownshift(props) {
  const { classes, label, teamName, onChangeText } = props;

  return (
    <div className={classes.root}>
      <DownshiftMultiple classes={classes} label={label} teamName={teamName} onChangeText={onChangeText}/>
    </div>
  );
}

IntegrationDownshift.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(IntegrationDownshift);
