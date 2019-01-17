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
        createMatch: action.open
          ? initialState.createMatch
          : { ...state.createMatch }
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
    case "UPDATE_HISTORY":
      var currentHistory = { ...state.history };
      var doNothing = false;
      switch (action.action) {
        case "back":
          //premo back
          if (currentHistory.past.length > 0) {
            //sposto nei future la current
            currentHistory.future.push(currentHistory.present);
            //sposto l'ultimo elemento nei past nel current
            currentHistory.present =
              currentHistory.past[currentHistory.past.length - 1];
            //elimino dai past l'ultimo elemento
            currentHistory.past.splice(currentHistory.past.length - 1, 1);
          } else {
            doNothing = true;
          }
          break;
        case "push":
          // navigo in una nuova pagina
          //pulisco future
          currentHistory.future = [];
          // sposto il current nei past
          currentHistory.past.push(currentHistory.present);
          //setto il nuovo current
          currentHistory.present = action.page;
          break;
        case "forward":
          //premo "avanti" nel browser
          if (currentHistory.future.length > 0) {
            //sposto current nei past
            currentHistory.past.push(currentHistory.present);
            //sposto l'ultimo future element nel present
            currentHistory.present =
              currentHistory.future[currentHistory.future.length - 1];
            //elimino l'ultimo future dai future
            currentHistory.future.splice(currentHistory.future.length - 1, 1);
          } else {
            doNothing = true;
          }
          break;
      }
      currentHistory = { ...currentHistory, doNothing: doNothing };
      return {
        ...state,
        history: currentHistory
      };
    default:
      return state;
  }
};
