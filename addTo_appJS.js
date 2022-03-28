// function isDebugBuild() {
//   return __SENTRY_DEBUG__;
// }
//
// function isFriday() {
//   return Sentry.__FRIDAY__;
// }
//
// Sentry.isFriday() && console.log('racoon');

// *******************************

// const __SENTRY_DEBUG__ = false;
//
const __FRIDAY__ = false;
function isFriday() {
  return __FRIDAY__;
}
isFriday() && console.log('racoon');

// const Monday = isFriday();
