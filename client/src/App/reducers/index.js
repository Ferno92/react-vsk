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
        dashboard: { ...state.dashboard, createMatchOpen: action.open }
      };
    case "UPDATE_CREATE_MATCH":
    return {
      ...state,
      createMatch: { ...state.createMatch, [action.obj]: action.value }
    };
    default:
      return state;
  }
};
