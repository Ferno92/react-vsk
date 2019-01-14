import { createStore } from "redux";
import reducer from "../reducers/reducers";

export const initialState = {
  appBar: {
    visible: true,
    navigationMenuOpen: false,
    logoutDialogOpen: false
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
  }
};
const store = createStore(reducer, initialState);

export default store;
