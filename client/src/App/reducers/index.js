export default (state, action) => {
    switch (action.type) {
      case "UPDATE_APPBAR":
        return {
          ...state,
          appBar: {...state.appBar, [action.obj]: action.value}
        };
        case "SHOW_CREATEMATCH":
        return {
          ...state,
          dashboard: {...state.dashboard, createMatchOpen: action.open}
        };
      default:
        return state;
    }
  };