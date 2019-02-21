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
    case "UPDATE_LOGGED_USER":
      return {
        ...state,
        loggedIn: action.loggedIn
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
            if (currentHistory.present !== "dashboard") {
              //elimino dai past l'ultimo elemento
              currentHistory.past.splice(currentHistory.past.length - 1, 1);
            } else {
              //pulisco past
              currentHistory.past = [];
            }
          } else if (currentHistory.present !== "dashboard") {
            //come push di dashboard
            //pulisco past
            currentHistory.past = [];
            //pulisco future
            currentHistory.future = [];
            //setto il nuovo current
            currentHistory.present = "dashboard";
          } else {
            doNothing = true;
          }
          break;
        case "push":
          // navigo in una nuova pagina
          if (action.page !== currentHistory.present) {
            //pulisco future
            currentHistory.future = [];
            if (action.page === "dashboard") {
              //pulisco past
              currentHistory.past = [];
            } else {
              // sposto il current nei past
              if (
                currentHistory.present !== null &&
                currentHistory.present !== "createMatch"
              ) {
                currentHistory.past.push(currentHistory.present);
              }
            }
            //setto il nuovo current
            currentHistory.present = action.page;
          } else {
            doNothing = true;
          }
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
        case "doNothing":
          doNothing = action.page;
          break;
        default:
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
