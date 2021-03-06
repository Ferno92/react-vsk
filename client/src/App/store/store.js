import { createStore } from "redux";
import reducer from "../reducers/reducers";

export const initialState = {
  appBar: {
    visible: true,
    navigationMenuOpen: false,
    logoutDialogOpen: false,
    fabVisible: true,
    search: false,
    inputSearch: "",
    searchButtonVisible: true
  },
  dashboard:{
    createMatchOpen: false
  },
  createMatch: {
    teamA: "",
    teamB: "",
    save: false
  },
  message: {
    text: "",
    type: "success",
    on: false
  },
  history: {
    past: [],
    present: null,
    future: []
  },
  loggedIn: false,
  myTeams: {
    createTeamOpen: false
  }
};
const store = createStore(reducer, initialState);

export default store;
