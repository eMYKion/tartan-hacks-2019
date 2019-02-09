var socket = io();

var worldInfo = {x:0, y:0, z:0, sx:1, sy:1, sz:1};
var stretchRequest = 1;

//set callback to set worldInfo from server
socket.on(Message.STRETCH_REQUEST, function(msg){
    stretchRequest = msg.scale;
    console.log(stretchRequest);
});

var WIDTH = window.innerWidth;
var HEIGHT = window.innerHeight;

var VIEW_ANGLE = 45;
var ASPECT = WIDTH / HEIGHT;
var NEAR = .1;
var FAR = 1000;
var EyeHeight = 2;
var fallLimit = -100;

var controls, room;
var container = document.getElementById("container");

var renderer = THREE.WebGLRenderer();//aliasing
var camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
var loader = new THREE.FBXLoader();
var scene = new THREE.Scene();
var pastTime = Date.now();
var deltaTime = 1;
var endFlag;
var levelFinished = false;
var flagAnim = 0;

var lightPos = [[new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 10, -5), new THREE.Vector3(0, 10, -10), new THREE.Vector3(0, -5, -5)], 
				[new THREE.Vector3(0, 0, 0)]]
var endPos = [new THREE.Vector3(0, 7.5, -12), new THREE.Vector3(0, 7.5, -12)]
var levelNames = ["Room2.fbx", "level1.1.fbx"]
var levelCnt = 0;

var playerVel = new THREE.Vector3(0, 0, 0);
var offset = new THREE.Vector3(0, 0, 0);

buildWorld(0);

controls = new THREE.PointerLockControls( camera );
scene.add( controls.getObject() );
controls.getObject().position.y = 2;

enablePointerLock();

var renderer = new THREE.WebGLRenderer();
renderer.setSize(WIDTH, HEIGHT);

container.appendChild(renderer.domElement);
requestAnimationFrame(update);

//DEBUG ONLY VARIABLE!
var stretchState = 0;


function doStretch() {
    
	//Get the previous amount the room was stretched
	var pastScale = room.scale.clone();
	//Get the position of the room relative to the player's feet
	offset = new  THREE.Vector3(room.position.x - (controls.getObject().position.x), 
								room.position.y - (controls.getObject().position.y - EyeHeight),
								room.position.z - (controls.getObject().position.z));

	//Calculate our proportions
	//var stretch = Math.pow(2,Math.sin(Date.now() / 1000));
	stretchState = stretchRequest;
	var stretch = Math.pow(2, stretchState);
	var squash = 1 / Math.sqrt(stretch);

	//var newScale = new THREE.Vector3(squash, stretch, squash);
	var newScale = new THREE.Vector3(squash, stretch, squash);

	//Resize the room
	room.scale.x = newScale.x;
	room.scale.y = newScale.y;
	room.scale.z = newScale.z;

	//Find the ratio which our room has warped since last frame
	offset.x = offset.x / pastScale.x * newScale.x;
	offset.y = offset.y / pastScale.y * newScale.y;
	offset.z = offset.z / pastScale.z * newScale.z;

	//Tweak the relative position
	room.position.x = controls.getObject().position.x + offset.x;
	room.position.y = controls.getObject().position.y - EyeHeight + offset.y;
	room.position.z = controls.getObject().position.z + offset.z;
    
    /*room.scale.x = worldInfo.sx;
    room.scale.y = worldInfo.sy;
    room.scale.z = worldInfo.sz;
    room.position.x = worldInfo.x;
    room.position.y = worldInfo.y;
    room.position.z = worldInfo.z;*/
    worldInfo.sx = room.scale.x;
    worldInfo.sy = room.scale.y;
    worldInfo.sz = room.scale.z;
    worldInfo.x = room.position.x;
    worldInfo.y = room.position.y;
    worldInfo.z = room.position.z;
}

function playerMove() {
  	var z = -((keyboardState.w || keyboardState.up) - (keyboardState.s || keyboardState.do));
  	var x = (keyboardState.d || keyboardState.ri) - (keyboardState.a || keyboardState.le);
  	var jump = keyboardState.space;

  	var pLocal = new THREE.Vector3(x, 0, z); //in front of camera				
  	var pWorld = pLocal.applyMatrix4(controls.getObject().matrixWorld);
  
  	var dir = pWorld.sub(controls.getObject().position).normalize();

  	var ray = new THREE.Raycaster(controls.getObject().position, new THREE.Vector3(0, -1, 0), 0, EyeHeight);			
  	var intersects = ray.intersectObjects(scene.children, true);

  	var onFloor = intersects.length != 0;

  	if(!onFloor) {
  		//Dampen player motion a little bit
  		playerVel.x = dir.x * 10 * .05 + playerVel.x * .95;
  		playerVel.z = dir.z * 10 * .05 + playerVel.z * .95;
  		
	  	ray = new THREE.Raycaster(new THREE.Vector3(controls.getObject().position.x, 
  													controls.getObject().position.y - EyeHeight, 
  													controls.getObject().position.z), new THREE.Vector3(0, 1, 0), 0, EyeHeight);		
	  	var intersects = ray.intersectObjects(scene.children, true);

	  	//If we hit the ceiling
	  	if(intersects.length != 0) {
	  		playerVel.y = 0;
	  	}
  		
  		playerVel.y -= 9.8 * deltaTime;
  	}
  	else //We're on the floor
  	{
  		//Dampen player motion a little bit
  		playerVel.x = dir.x * 10 * .2 + playerVel.x * .8;
  		playerVel.z = dir.z * 10 * .2 + playerVel.z * .8;

  		//If we land on a spring, bounce, otherwise, just stop
  		if(intersects[0].object.name == "Spring") {
  			playerVel.y *= -1;
  		}
  		else
  		{
  			playerVel.y = 0;//-playerVel.y;
	  	}
	  	//Handle jumping
	  	if (jump) {
	  		playerVel.y = 5;
	  	}
  	}

  	//Do wall intersections
  	wallIntersect();

  	controls.getObject().position.x += (playerVel.x * deltaTime);
  	controls.getObject().position.y += (playerVel.y * deltaTime);
  	controls.getObject().position.z += (playerVel.z * deltaTime);

  	//If we fall too far, just reset
  	if(controls.getObject().position.y - room.position.y <= fallLimit) {
  		controls.getObject().position.x = room.position.x;
  		controls.getObject().position.y = EyeHeight + room.position.y;
  		controls.getObject().position.z = room.position.z;
  		playerVel = new THREE.Vector3(0, 0, 0);
  	}
}

function wallIntersect() {
	var cnt = 0;
	do {
	ray = new THREE.Raycaster(controls.getObject().position, new THREE.Vector3(playerVel.x, 0, playerVel.z).normalize(), 0, 1);			
  	intersects = ray.intersectObjects(scene.children, true);

  		if(intersects.length == 0) {
  			ray = new THREE.Raycaster(new THREE.Vector3(controls.getObject().position.x, 
  														controls.getObject().position.y - EyeHeight / 2, 
  														controls.getObject().position.z), new THREE.Vector3(playerVel.x, 0, playerVel.z).normalize(), 0, 1);			
  			intersects = ray.intersectObjects(scene.children, true);
  		}

  		if (intersects.length != 0) {
  			var intersectNorm = intersects[0].face.normal;

  			//Fix the direction of the normals, since blender broke them
  			//Hold the y coordinate as we swap y and z
  			var tmpY = intersectNorm.y;
  			intersectNorm.y = intersectNorm.z;
  			intersectNorm.z = tmpY

  			//console.log(intersectNorm);
  			var velProj = new THREE.Vector3(playerVel.x, 0, playerVel.z).projectOnVector(intersectNorm);
  			playerVel.sub(velProj);
  		}

  		//Increment the counter so we can't get stuck in an infinite loop
  		cnt++;
  	} while(intersects.length != 0 && (cnt < 3))
}

function update() {
	time = Date.now()
	deltaTime = (time - pastTime) / 1000;
	pastTime = time;
	//console.log(deltaTime);
	playerMove();
	doStretch();

	if(endFlag != undefined) {
		//console.log(controls.getObject().position.distanceTo(endFlag.getWorldPosition()));

		if(controls.getObject().position.distanceTo(endFlag.getWorldPosition()) < 4) {
			levelFinished = true;
		}
		if (levelFinished && flagAnim <= 3) {
			flagAnim = Math.min(flagAnim+2*deltaTime, 3);
			//A basic little animation curve to make the flag pop
			var s = .7*Math.sin(Math.PI*Math.min(flagAnim, 1))+1-Math.min(flagAnim, 1); 
			endFlag.scale.x = s * .01;
			endFlag.scale.y = s * .01;
			endFlag.scale.z = s * .01;
		}

		if(flagAnim >= 3) {
			//alert("Level completed");
			levelFinished = false;
			flagAnim = 0;
			destroyWorld();
			levelCnt++;
			buildWorld(levelCnt);
		}
	}

    //socket send player
    socket.emit(Message.PLAYER, {
    	x : -room.position.x + controls.getObject().position.x, 
    	y : -room.position.y + EyeHeight + controls.getObject().position.y, 
    	z : -room.position.z + controls.getObject().position.z
    });
    
    if(worldInfo != undefined) {
    if(!(worldInfo.xs == undefined || worldInfo.ys == undefined || worldInfo.zs == undefined)){
	    socket.emit(Message.WORLD, {
	    	x : worldInfo.x, 
	    	y : worldInfo.y, 
	    	z : worldInfo.z, 
	    	
	    	xs : worldInfo.xs, 
	    	ys : worldInfo.ys, 
	    	zs : worldInfo.zs
	    });
    }
    }
    
  	renderer.render(scene, camera);
  	requestAnimationFrame(update);
}

function buildWorld(l) {
	levelFinished = false;
	//Container for all room geometry
	room = new THREE.Group();
	var ambientLight = new THREE.AmbientLight(0x222222);
	scene.add(ambientLight);

	for(i = 0; i < lightPos[l].length; i++) {
		console.log(lightPos[l][i]);
		var light = new THREE.PointLight( 0xffffff, 1, 20 );
		light.position.set(lightPos[l][i].x, lightPos[l][i].y, lightPos[l][i].z)
		room.add(light);
	}

	/*loader.load('Portrait.fbx', function ( port ) {
		//Scale down FBX objects, since theyre 100 times too big
		port.scale.x = .01;
		port.scale.y = .03;
		port.scale.z = .03;

		//port.rotation.y = -Math.PI/2;
		port.position.x -= 2.5;
		port.position.z -= 5;

		//Just give it a smooth tecture
		port.traverse( function ( child ) {
        	if ( child instanceof THREE.Mesh ) {
        		child.material.specular.r = 0.1;
        		child.material.specular.g = 0.1;
        		child.material.specular.b = 0.1;
        	}
    	} );
		room.add( port );
	} );

	loader.load('Portrait.fbx', function ( port2 ) {
		//Scale down FBX objects, since theyre 100 times too big
		port2.scale.x = .01;
		port2.scale.y = .03;
		port2.scale.z = .03;

		//port.rotation.y = -Math.PI/2;
		port2.position.y += 10;
		port2.position.z -= 2.5;
		port2.rotation.y = Math.PI / 2;

		//Just give it a smooth tecture
		port2.traverse( function ( child ) {
        	if ( child instanceof THREE.Mesh ) {
        		child.material.specular.r = 0.1;
        		child.material.specular.g = 0.1;
        		child.material.specular.b = 0.1;
        	}
    	} );
		room.add( port2 );
	} );*/

	loader.load('EndFlag.fbx', function ( flag ) {
		//Scale down FBX objects, since theyre 100 times too big
		flag.scale.x = .01;
		flag.scale.y = .01;
		flag.scale.z = .01;

		//port.rotation.y = -Math.PI/2;
		flag.position.x = endPos[l].x;
		flag.position.y = endPos[l].y;
		flag.position.z = endPos[l].z;

		//Just give it a smooth tecture
		flag.traverse( function ( child ) {
        	if ( child instanceof THREE.Mesh ) {
        		child.material.specular.r = 0.1;
        		child.material.specular.g = 0.1;
        		child.material.specular.b = 0.1;
        	}
    	} );
		room.add( flag );
		endFlag = flag;
	} );


	loader.load(levelNames[l], function ( object ) {
		//Scale down FBX objects, since theyre 100 times too big
		object.scale.x = .01;
		object.scale.y = .01;
		object.scale.z = .01;
        
        //console.log("Test");

		//Just give it a smooth tecture
		object.traverse( function ( child ) {
        	if ( child instanceof THREE.Mesh ) {
        		//child.material = new THREE.MeshStandardMaterial({color:0xffffff, roughness:.8});
        		//console.log(child.material);
        		child.material.specular.r = 0.1;
        		child.material.specular.g = 0.1;
        		child.material.specular.b = 0.1;
        	}
    	} );
		room.add( object );
	} );

	//var springTex = new THREE.TextureLoader().load( "Canvas.jpg" );

	var spring = new THREE.Mesh(
	    new THREE.PlaneGeometry(5, 5, 1, 1),
	    new THREE.MeshStandardMaterial( {color: 0x999999, roughness:1} )
  	);
  	spring.position.y -= 7.5;
  	spring.position.z -= 5;
  	spring.rotation.x = -Math.PI/2;
  	spring.name = "Spring";

  	room.add(spring);

	//room.add(floor, wall1, wall2);
	scene.add(room);
}

function destroyWorld() {
	scene.remove(room);
	controls.getObject().position.x = 0;
	controls.getObject().position.y = 0;
	controls.getObject().position.z = 0;
	playerVel.x = 0;
	playerVel.y = 0;
	playerVel.z = 0;
}

function enablePointerLock(){
    var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;
  if(havePointerLock){
    var element = document.body;
    controls.enabled = true;
    var pointerlockchange = function ( event ) {    };
    var pointerlockerror = function ( event ) {
        alert("error");
    };

    // Hook pointer lock state change events
    document.addEventListener( 'pointerlockchange', pointerlockchange, false );
    document.addEventListener( 'mozpointerlockchange', pointerlockchange, false );
    document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false );

    document.addEventListener( 'pointerlockerror', pointerlockerror, false );
    document.addEventListener( 'mozpointerlockerror', pointerlockerror, false );
    document.addEventListener( 'webkitpointerlockerror', pointerlockerror, false );

    document.addEventListener( 'click', function ( event ) {

      // Ask the browser to lock the pointer
    element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
    element.requestPointerLock();

    }, false );

  } else {

    alert("browser doesn\'t support PointerLock API");

  }
}