import { createStore } from "redux";
import reducer from "../reducers/reducers";

export const initialState = {
  appBar: {
    visible: true,
    navigationMenuOpen: false,
    logoutDialogOpen: false,
    fabVisible: true,
    search: false,
    inputSearch: ""
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
  loggedIn: false
};
const store = createStore(reducer, initialState);

export default store;
