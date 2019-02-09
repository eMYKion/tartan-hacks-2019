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

xhttp.onreadystatechange = function(){
    if(this.readyState == 4 && this.status == 200){
        
        var script = document.createElement("script");
        script.text = xhttp.responseText;
        console.log("got script");
        document.head.appendChild(script);
    }
};

if(!isMobile()){
    xhttp.open("GET", "/PointerLockControls.js", false);
    xhttp.send();
    xhttp.open("GET", "/keyboard.js", false);
    xhttp.send();
    xhttp.open("GET", "/pc_client.js", false);
    xhttp.send();
}else{
    xhttp.open("GET", "/DeviceOrientationControls.js", false);
    xhttp.send();
    xhttp.open("GET", "/mobile_client.js", false);
    xhttp.send();   
}

console.log("Finished loading client.");