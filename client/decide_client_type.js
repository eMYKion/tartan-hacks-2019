function isMobile(){
    if(navigator.userAgent.match(/Android/i) ||
        navigator.userAgent.match(/weOS/i) ||
        navigator.userAgent.match(/iPhone/i) ||
        navigator.userAgent.match(/iPad/i) ||
        navigator.userAgent.match(/iPod/i) ||
        navigator.userAgent.match(/BlackBerry/i) ||
        navigator.userAgent.match(/Windows Phone/i)){
        return true;
    }else{
        return false;
    }
};

var xhttp = new XMLHttpRequest();

var success = true;
var scriptResponses = [];

function addScriptsAsElements(scripts){
    var tmp = scripts.slice();
    
    while(tmp.length > 0){
        var script = document.createElement("script");
        script.text = tmp.pop();//get earliest loaded response
        document.head.appendChild(script);
    }
}

xhttp.onreadystatechange = function(){
    if(this.readyState == 4 && this.status == 200){
        
        scriptResponses.unshift(xhttp.responseText);
        
    }else if(this.readyState == 4 && this.status == 404){
        
        success = false;
        
    }
};

function getResource(file){
    xhttp.open("GET", file, false);
    xhttp.send();
}

var PCRecources = [//must be in order of dependencies
    "/PointerLockControls.js", 
    "/keyboard.js",
    "/pc_client.js"
];

var MobileRecources = [//must be in order of dependencies
    "/DeviceOrientationControls.js",
    "/mobile_client.js"
];

if(!isMobile()){
    for(var i = 0; i < PCRecources.length; i++){
        getResource(PCRecources[i]);
    }
}else{
    for(var i = 0; i < MobileRecources.length; i++){
        getResource(MobileRecources[i]);
    }
}

if(!success){
    alert("got 404 for one or more files");
    console.log("got 404 for one or more files");
    var msg = document.createElement("h1");
    msg.innerHTML = "One or more files failed to load!";
    document.body.appendChild(msg);
}else{
    addScriptsAsElements(scriptResponses);
    console.log("Finished loading client.");
}