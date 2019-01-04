export function updateAppbar (obj, value) {
   console.log("updateAppbar");
    return {
       type: "UPDATE_APPBAR",
       value: value,
       obj: obj
     }
  }