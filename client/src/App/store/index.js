import { createStore } from "redux";
import reducer from "../reducers/index";

const initialState = {
  appBar: {
    visible: true,
    navigationMenuOpen: false,
    logoutDialogOpen: false
  }
};
const store = createStore(reducer, initialState);

export default store;
