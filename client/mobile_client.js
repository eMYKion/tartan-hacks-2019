var socket = io();

var playerInfo = {x:0, y:0, z:0};
var worldInfo = {x:0, y:0, z:0, sx:1, sy:1, sz:1};

var playerBox = new THREE.Mesh (
    new THREE.BoxGeometry(1, 2, 1),
    new THREE.MeshBasicMaterial({color:0xffa500})
);

//set callback to set worldInfo from server
socket.on(Message.PLAYER, function(msg){
    playerInfo.x = msg.x;
    playerInfo.y = msg.y;
    playerInfo.z = msg.z;
});

var WIDTH = window.innerWidth;
var HEIGHT = window.innerHeight;

var VIEW_ANGLE = 45;
var ASPECT = WIDTH / HEIGHT;
var NEAR = .1;
var FAR = 1000;
var EyeHeight = 2;

var controls, room;
var container = document.getElementById("container");

var renderer = new THREE.WebGLRenderer();
var camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
camera.position.y = 10;
camera.position.x = 5;
camera.position.z = 5;
var pos = document.createElement("p");
document.body.appendChild(pos);
var loader = new THREE.FBXLoader();
var scene = new THREE.Scene();
var pastTime = Date.now();
var deltaTime = 1;

var playerVel = new THREE.Vector3(0, 0, 0);
var offset = new THREE.Vector3(0, 0, 0);

buildWorld();

controls = new THREE.DeviceOrientationControls(camera);
controls.connect();
//controls = //new THREE.PointerLockControls( camera );
//scene.add( controls.getObject() );
//controls.getObject().position.y = 2;

var renderer = new THREE.WebGLRenderer();
renderer.setSize(WIDTH, HEIGHT);

container.appendChild(renderer.domElement);
requestAnimationFrame(update);


function doStretch() {
    /*
	var pastScale = room.scale.clone();
	offset = new  THREE.Vector3(room.position.x - (camera.position.x), 
								room.position.y - (camera.position.y - EyeHeight),
								room.position.z - (camera.position.z));

	console.log(offset.y);

	var stretch = Math.pow(2,Math.sin(Date.now() / 1000));
	var squash = 1 / Math.sqrt(stretch);

	var newScale = new THREE.Vector3(squash, stretch, squash);

	room.scale.x = newScale.x;
	room.scale.y = newScale.y;
	room.scale.z = newScale.z;

	//console.log(pastScale);	
	console.log(newScale.y / pastScale.y);

	offset.x = offset.x / pastScale.x * newScale.x;
	offset.y = offset.y / pastScale.x * newScale.y;
	offset.z = offset.z / pastScale.x * newScale.z;

	room.position.x = camera.position.x + offset.x;
	room.position.y = (camera.position.y - EyeHeight) + offset.y;
	room.position.z = camera.position.z + offset.z;
    */
    
    //set the message to send
    worldInfo.sx = room.scale.x;
    worldInfo.sy = room.scale.y;
    worldInfo.sz = room.scale.z;
    worldInfo.x = room.position.x;
    worldInfo.y = room.position.y;
    worldInfo.z = room.position.z;
}
/*
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

  	//Really basic gravity
  	if(!onFloor) {
  		//Dampen player motion a little bit
  		playerVel.x = dir.x * 10 * .05 + playerVel.x * .95;
  		playerVel.z = dir.z * 10 * .05 + playerVel.z * .95;
  		playerVel.y -= 9.8 * deltaTime;
  	}
  	else //We're on the floor
  	{
  		//Dampen player motion a little bit
  		playerVel.x = dir.x * 10 * .2 + playerVel.x * .8;
  		playerVel.z = dir.z * 10 * .2 + playerVel.z * .8;
  		playerVel.y = 0;
	  	//Handle jumping
	  	if (jump) {
	  		playerVel.y = 5;
	  	}
  	}

  	//Do wall intersections
  	wallIntersect();

  	controls.getObject().position.x += (playerVel.x * deltaTime);
  	//controls.getObject().position.y += (playerVel.y * deltaTime);
  	controls.getObject().position.z += (playerVel.z * deltaTime);

  	//If we fall too far, just reset
  	if(controls.getObject().position.y <= -10) {
  		controls.getObject().position.x = 0;
  		controls.getObject().position.y = EyeHeight;
  		controls.getObject().position.z = 0;
  		playerVel = new THREE.Vector3(0, 0, 0);
  	}
}

function wallIntersect() {
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
  			var velProj = new THREE.Vector3(playerVel.x, 0, playerVel.z).projectOnVector(intersectNorm);
  			playerVel.sub(velProj);
  		}
  	} while(intersects.length != 0)
}
*/
function update() {
	time = Date.now()
	deltaTime = (time - pastTime) / 1000;
	pastTime = time;
	//console.log(deltaTime);
    socket.emit(Message.WORLD, worldInfo);
	//playerMove();
	doStretch();
    
    playerBox.position.x = playerInfo.x;
    playerBox.position.y = playerInfo.y;
    playerBox.position.z = playerInfo.z;
    pos.text = "" + playerInfo.x + ", " + playerInfo.y + ", " + playerInfo.z; 
    
    controls.update();

  	renderer.render(scene, camera);
  	requestAnimationFrame(update);
}

function buildWorld() {
	//Container for all room geometry

    
	room = new THREE.Group();

	var floor = new THREE.Mesh (
	    new THREE.BoxGeometry(10, 1, 10),
	    new THREE.MeshBasicMaterial({color:0x6f9fed})
	);

	var wall1 = new THREE.Mesh (
	    new THREE.BoxGeometry(10, 3, 1),
	    new THREE.MeshBasicMaterial({color:0xff0000})
	);

	wall1.position.y = 1.5;
	wall1.position.z = 5.5;

	var wall2 = new THREE.Mesh (
	    new THREE.BoxGeometry(1, 2, 10),
	    new THREE.MeshBasicMaterial({color:0x00ff00})
	);

	wall2.position.y = 1;
	wall2.position.x = 5.5;

	floor.position.y = -.5

	/*loader.load( 'Room2.fbx', function ( object ) {
		//mixer = new THREE.AnimationMixer( object );
		//				var action = mixer.clipAction( object.animations[ 0 ] );
		//				action.play();
						object.traverse( function ( child ) {
							if ( child.isMesh ) {
								child.castShadow = true;
								child.receiveShadow = true;
							}
						} );
						scene.add( object );
					} );*/

	room.add(floor, wall1, wall2);
	scene.add(room, playerBox);
}