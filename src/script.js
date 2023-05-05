//#region Init
import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { Vector3 } from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

var controls = new PointerLockControls(camera, renderer.domElement);
controls.pointerSpeed = 1.5;
scene.add(controls.getObject());

document.body.onresize = () => {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);
};

//#endregion

//Movement
const cameraSpeed = 0.2;
const keyboardState = {};
//Rotation
var blocker = document.getElementById('blocker');
var menu = document.getElementById('menuDiv');

var inter = undefined;

cameraStartPoint(new THREE.Euler(-17, 4, -10), -1.6)

var sphereGeometry = new THREE.SphereGeometry(500, 60, 40);
sphereGeometry.scale(-1, 1, 1);
var sphereMaterial = new THREE.MeshBasicMaterial({
	map: new THREE.TextureLoader().load('textures/sky/sky2.png')
});
var sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
scene.add(sphereMesh);

//#region Objects
const wallsMaterial = new THREE.MeshBasicMaterial({ color: 0xf1f1f1 });

const ground = new THREE.Mesh(new THREE.BoxGeometry(75, 0, 75), wallsMaterial);
const wall1 = new THREE.Mesh(new THREE.BoxGeometry(0, 10, 75), wallsMaterial);
wall1.position.setFromEuler(new THREE.Euler(75 / 2, 5, 0))
const wall2 = new THREE.Mesh(new THREE.BoxGeometry(0, 10, 75), wallsMaterial);
wall2.position.setFromEuler(new THREE.Euler(-75 / 2, 5, 0))
const wall3 = new THREE.Mesh(new THREE.BoxGeometry(75, 10, 0), wallsMaterial);
wall3.position.setFromEuler(new THREE.Euler(0, 5, 75 / 2))
const wall4 = new THREE.Mesh(new THREE.BoxGeometry(75, 10, 0), wallsMaterial);
wall4.position.setFromEuler(new THREE.Euler(0, 5, -75 / 2))

scene.add(ground);
scene.add(wall1);
scene.add(wall2);
scene.add(wall3);
scene.add(wall4);

new THREE.ObjectLoader().load('models/1.json', function (obj) {
	obj.position.set(0, 0, 0)
	scene.add(obj);
});


const cubeTexture = new THREE.TextureLoader().load('textures/2.png');
const cubeMaterial = new THREE.MeshBasicMaterial({ map: cubeTexture });

var test1

var loader = new OBJLoader();
loader.load('models/texture.obj',
	function (obj) {
		obj.traverse(function (child) {
			if (child instanceof THREE.Mesh) {
				child.material = cubeMaterial;
				child.name = "NewObject";
				test1 = child
			}
		});

		scene.add(obj);
	}
);;
const test2 = new THREE.Mesh(new THREE.SphereGeometry(2, 32, 32));
test2.position.add(new Vector3(10, 0, 10))
scene.add(test2);

//#endregion

//#region Event listeners
document.addEventListener('keydown', (event) => {
	keyboardState[event.code] = true;
});

document.addEventListener('keyup', (event) => {
	keyboardState[event.code] = false;
});

document.addEventListener('keypress', (event) => {
	if (blocker.style.display == "none") {
		switch (event.code) {
			case "KeyE":
				if (menu.style.display == "none") {
					menu.style.display = "block"
					controls.unlock()
				} else {
					menu.style.display = "none"
					controls.lock()
				}
				break;
			default:
			// code block
		}
	}
});

controls.addEventListener('lock', () => {
	blocker.style.display = "none";
});

controls.addEventListener('unlock', () => {
	if (menu.style.display == "block") return;
	blocker.style.display = "block";
})

document.getElementById('blocker').addEventListener('click', function () {
	/* 
	document.body.requestFullscreen()
	.then(()=>(
		controls.lock()
	));
	/*/
	controls.lock();
	//*/
});

// document.addEventListener("click", () => {
// 	if (controls.isLocked) {
// 		if (inter == undefined) {
// 			inter = setInterval(onMouseClick, 10)
// 		} else {
// 			clearInterval(inter)
// 			inter = undefined
// 		}
// 	}

// })

//#endregion

var raycaster = new THREE.Raycaster();

function onMouseClick() {
	if (controls.isLocked && test1 != undefined) {
		// nastavíme paprsek
		raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);

		// zjistíme, zda paprsek koliduje s krychlí
		// console.log(test1);
		var intersects = raycaster.intersectObjects(scene.children)
		intersects = intersects.filter(e => e.object != test1);

		// pokud paprsek koliduje s krychlí, změníme její barvu
		if (intersects.length > 0) {
			test1.position.set(intersects[0].point.x, intersects[0].point.y, intersects[0].point.z)
			test1.lookAt(intersects[0].point.add(intersects[0].face.normal	))
		}
	}
}

function cameraStartPoint(positionVector = new THREE.Euler(), rotationY = 0) {
	camera.position.setFromEuler(positionVector);

	camera.rotation.y = rotationY;
}

function movement() {
	var direction = new THREE.Vector3();
	if (keyboardState['KeyW']) direction.z -= 1;
	if (keyboardState['KeyS']) direction.z += 1;
	if (keyboardState['KeyA']) direction.x -= 1;
	if (keyboardState['KeyD']) direction.x += 1;

	camera.localToWorld(direction)
	direction.sub(camera.position);
	direction.y = 0;
	direction.normalize()
	camera.position.addScaledVector(direction, cameraSpeed);

}

function animate() {
	requestAnimationFrame(animate);

}

function render() {
	requestIdleCallback(render);

	if (controls.isLocked) {
		movement()

	}
	renderer.render(scene, camera);
}

animate()
render()
