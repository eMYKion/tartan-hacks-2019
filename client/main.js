var socket = io();

var button = document.getElementById("button");

button.addEventListener("click", function(){ 
  socket.emit(Message.WORLD, {data:"HELLO"});  
});