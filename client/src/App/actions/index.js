export function updateAppbar(obj, value) {
  console.log("action updateAppbar");
  return {
    type: "UPDATE_APPBAR",
    value: value,
    obj: obj
  }
}
export function showCreateMatch(value) {
  console.log("action showCreateMatch", value);
  return {
    type: "SHOW_CREATEMATCH",
    open: value
  }
}