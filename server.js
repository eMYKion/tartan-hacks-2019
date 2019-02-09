//var PORT = process.env.PORT;
//var IP = process.env.IP;
var PORT = 3000;
var IP = "localhost";


const Message = require("./server_constants.js")
//app is a function handler
var express = require("express");
var app = express();
//http is the actual server library
var http = require("http").Server(app);
//io is for sockets
var io = require("socket.io")(http);

const MAX_QUEUE_SIZE = 2;
var clientQueue = [];//a queue of client sockets
//unshift -> add to beginning of array
//pop -> pop from back

app.get("/", function(req, res){
    if(clientQueue.length >= MAX_QUEUE_SIZE){
        res.sendFile(__dirname + "/client/full.html");
    }else{
        
        res.sendFile(__dirname + "/client/index.html");
    }
    
})

app.use(express.static("client"));//looks in the client folder

io.on(Message.CONNECTION, function(socket){
    
    if(clientQueue.length >= MAX_QUEUE_SIZE){
        socket.disconnect(true);
        return;    
    }
    //add client to list
    clientQueue.unshift(socket);
    console.log("a user connected, " + clientQueue.length + " clients connected.");
    
    
    socket.on(Message.WORLD, function(msg){
        io.emit(Message.WORLD, msg);
    });
    
    socket.on(Message.PLAYER, function(msg){
        io.emit(Message.PLAYER, msg);
    });
    
    socket.on(Message.DISCONNECT, function(){
        console.log("a user disconnected");
        
        for(var i = 0; i < clientQueue.length; i++){
            
            sock = clientQueue[i];
            if(sock.id == socket.id){
                clientQueue.splice(i, 1);
                console.log("removed client from list");
                break;
            }
        }
        
    });
    
});

http.listen(PORT, IP, function(){
    console.log("listening on " + IP + ":" + PORT);
});


