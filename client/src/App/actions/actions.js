export function updateAppbar(obj, value) {
  // console.log("action updateAppbar");
  return {
    type: "UPDATE_APPBAR",
    value: value,
    obj: obj
  };
}
export function showCreateMatch(value) {
  // console.log("action showCreateMatch", value);
  return {
    type: "SHOW_CREATEMATCH",
    open: value
  };
}

export function updateCreateMatch(obj, value) {
  // console.log("action updateCreateMatch " + obj, value);
  return {
    type: "UPDATE_CREATE_MATCH",
    value: value,
    obj: obj
  };
}

export function resetMessages() {
  return {
    type: "RESET_MESSAGES"
  };
}

export function showMessageAction(type, text) {
  return {
    type: "MESSAGE_ACTION",
    messageType: type,
    text: text
  };
}

export function updateHistory(action, page) {
  return {
    type: "UPDATE_HISTORY",
    action: action,
    page: page
  };
}

export function updateLoggedUser(loggedIn) {
  return {
    type: "UPDATE_LOGGED_USER",
    loggedIn: loggedIn
  };
}
