import { initialState } from "../store/store";

export default (state, action) => {
  console.log("reducer " + action.type, action);
  switch (action.type) {
    case "UPDATE_APPBAR":
      return {
        ...state,
        appBar: { ...state.appBar, [action.obj]: action.value }
      };
    case "SHOW_CREATEMATCH":
      return {
        ...state,
        dashboard: { ...state.dashboard, createMatchOpen: action.open },
        createMatch: action.open ? initialState.createMatch : { ...state.createMatch }
      };
    case "UPDATE_CREATE_MATCH":
      return {
        ...state,
        createMatch: { ...state.createMatch, [action.obj]: action.value }
      };
    case "RESET_MESSAGES":
      return {
        ...state,
        message: initialState.message
      };
    case "MESSAGE_ACTION":
      return {
        ...state,
        message: {
          type: action.messageType,
          text: action.text,
          on: true
        }
      };
    default:
      return state;
  }
};
