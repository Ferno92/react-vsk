export default (state, action) => {
    switch (action.type) {
      case "UPDATE_APPBAR":
        return {
          ...state,
          appBar: {...state.appBar, [action.obj]: action.value}
        };
  
      default:
        return state;
    }
  };