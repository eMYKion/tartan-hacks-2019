const wasdKey = {w:87, a:65, s:83, d:68};
const uldrKey = {up:38, le:37, do:40, ri:39};
const otherKeys = {space:32, shift:16};
var keyboardState = {w:0, a:0, s:0, d:0, up:0, le:0, do:0, ri:0, space:0, shift:0};

window.addEventListener("keydown", function(event){
  
  switch(event.keyCode){
    case(wasdKey.up):
      keyboardState.up = 1;
      break;
    case(wasdKey.le):
      keyboardState.le = 1;
      break;
    case(wasdKey.do):
      keyboardState.do = 1;
      break;
    case(wasdKey.ri):
      keyboardState.ri = 1;
      break;

    case(wasdKey.w):
      keyboardState.w = 1;
      break;
    case(wasdKey.a):
      keyboardState.a = 1;
      break;
    case(wasdKey.s):
      keyboardState.s = 1;
      break;
    case(wasdKey.d):
      keyboardState.d = 1;
      break;

    case(otherKeys.space):
      keyboardState.space = 1;
      break;
    case(otherKeys.shift):
      keyboardState.shift = 1;
      break;

    default:
      break;
  }
  
});

// check if keys are up, and update keyboardState to reflect new state
window.addEventListener("keyup", function(event){
  
  switch(event.keyCode){
    case(wasdKey.up):
      keyboardState.up = 0;
      break;
    case(wasdKey.le):
      keyboardState.le = 0;
      break;
    case(wasdKey.do):
      keyboardState.do = 0;
      break;
    case(wasdKey.ri):
      keyboardState.ri = 0;
      break;

    case(wasdKey.w):
      keyboardState.w = 0;
      break;
    case(wasdKey.a):
      keyboardState.a = 0;
      break;
    case(wasdKey.s):
      keyboardState.s = 0;
      break;
    case(wasdKey.d):
      keyboardState.d = 0;
      break;

    case(otherKeys.space):
      keyboardState.space = 0;
      break;
    case(otherKeys.shift):
      keyboardState.shift = 0;
      break;

    default:
      break;
  }
  
});