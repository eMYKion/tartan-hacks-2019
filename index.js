PORT = 3000;

//app is a function handler
var app = require("express")();

//http is the actual server library
var http = require("http").Server(app);

app.get("/", function(req, res){
    res.sendFile(__dirname + "/index.html");
})

http.listen(PORT, function(){
    console.log("listening on *:3000");
});


