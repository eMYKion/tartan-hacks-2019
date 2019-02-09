var PORT = 3000;
const Message = require("./server_constants.js")

//app is a function handler
var app = require("express")();

//http is the actual server library
var http = require("http").Server(app);

//io is for sockets
var io = require("socket.io")(http);

app.get("/", function(req, res){
    res.sendFile(__dirname + "/index.html");
});

app.get("/socket.io.slim.js", function(req, res){
    res.sendFile(__dirname + "/client/socket.io.slim.js");
});

app.get("/three.min.js", function(req, res){
    res.sendFile(__dirname + "/client/three.min.js");
});

app.get("/main.js", function(req, res){
    res.sendFile(__dirname + "/client/main.js");
});

app.get("/client_constants.js", function(req, res){
    res.sendFile(__dirname + "/client/client_constants.js");
});


io.on(Message.CONNECTION, function(socket){
    console.log("a user connected");
    
    socket.on(Message.WORLD, function(msg){
        
        console.log(msg.data);
    });
    
    socket.on(Message.DISCONNECT, function(){
        console.log("a user disconnected");
        
    });
    
});

http.listen(PORT, function(){
    console.log("listening on *:3000");
});


