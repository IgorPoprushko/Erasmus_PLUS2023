//#region Init
import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { Vector3 } from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { SSAOPass } from 'three/addons/postprocessing/SSAOPass.js';

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { RectAreaLightHelper }  from 'three/examples/jsm/helpers/RectAreaLightHelper.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create SkyBox
var sphereGeometry = new THREE.SphereGeometry(500, 60, 40);
sphereGeometry.scale(-1, 1, 1);
var sphereMaterial = new THREE.MeshBasicMaterial({
	map: new THREE.TextureLoader().load('images/sky/sky2.png')
});
var sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
scene.add(sphereMesh);

//MouseControls
var controls = new PointerLockControls(camera, renderer.domElement);

controls.maxPolarAngle -= 0.01;
controls.minPolarAngle += 0.01;

scene.add(controls.getObject());

document.body.onresize = () => {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);
};

// SSAO
const width = window.innerWidth;
const height = window.innerHeight;

var composer = new EffectComposer(renderer);

const ssaoPass = new SSAOPass(scene, camera, width, height);
ssaoPass.kernelRadius = 2;
composer.addPass(ssaoPass);
//

// Lights
const intensity = 1;
const rectLight = new THREE.RectAreaLight( 0xffffff, intensity,  100, 100 );
rectLight.position.set(0, 20, 0);
rectLight.lookAt( 0, 1, 0 );
scene.add( rectLight )

// const rectLightHelper = new RectAreaLightHelper( rectLight );
// rectLight.add( rectLightHelper );
//#endregion

//#region Variables
//System
var raycaster = new THREE.Raycaster();
var loaderOBJ = new OBJLoader();
const loaderGLTF = new GLTFLoader();
var raycastInterval = undefined;

var isSSAOTurnOn = 0;  // TurnON SSAO

//Movement
const cameraSpeed = 0.2;
controls.pointerSpeed = 1.5;
const keyboardState = {};

//HTML
var blocker = document.getElementById('blocker');
var menu = document.getElementById('menuDiv');
var menuDivs = document.querySelectorAll(".menuImages");
var productDivs = document.querySelectorAll(".productContainer");
var backButton = document.querySelector("#backButton");

//ObjectS
let modelFilenames = {
	'1': () => import.meta.glob(`/models/1/*.glb`),
	'2': () => import.meta.glob(`/models/2/*.glb`),
	'3': () => import.meta.glob(`/models/3/*.glb`),
	'4': () => import.meta.glob(`/models/4/*.glb`),
	'5': () => import.meta.glob(`/models/5/*.glb`)
}

var objRotationZ = 0;
var AllObjects = [{}, {}, {}, {}, {}];
for (let j = 0; j < menuDivs.length; j++) {
	var local = Object.keys(modelFilenames[j + 1]());
	Object.keys
	for (let i = 0; i < local.length; i++) {
		AllObjects[j][local[i].replace(`/models/${j + 1}/`, "").replace(".glb", "")] = local[i];
	}
}

var raycastObject = undefined;

var MyObjects = [];

//#endregion

//#region onStart
cameraStartPoint(new THREE.Euler(-17, 4, -10), -1.6)
createProducts()
//#endregion

//#region Objects

//Box
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

//House
new THREE.ObjectLoader().load('models/1.json', function (obj) {
	obj.position.set(0, 0, 0)
	scene.add(obj);
});

//TestSphere
const test2 = new THREE.Mesh(new THREE.SphereGeometry(2, 32, 32));
test2.position.add(new Vector3(10, 0, 10))
scene.add(test2);

//#endregion

//#region Listeners
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
				clearInterval(raycastInterval)
				raycastInterval = undefined;
				if (raycastObject != null) {
					scene.remove(raycastObject.parent);
					raycastObject = undefined;
				}
				trigerMenu()
				break;

			default:
			// code block
		}
	}
});

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

document.addEventListener("mousedown", (event) => {
	if (!controls.isLocked) return;

	if (raycastInterval != undefined) {
		if (event.button == 0) {
			clearInterval(raycastInterval)
			raycastInterval = undefined;

			createEntity(raycastObject.name).then((obj) => {
				raycastInterval = setInterval(() => raycastMovement(obj), 1000 / 60);
				raycastObject = obj;
			})


		} else if (event.button == 2) {
			clearInterval(raycastInterval)
			raycastInterval = undefined;
			scene.remove(raycastObject);
			raycastObject = undefined;
		}
	} else {
		if (event.button == 0) {
			var obj = getElementbyRaycast(new THREE.Vector2());
			objRotationZ = obj.rotation.z
			raycastInterval = setInterval(() => raycastMovement(obj), 1000 / 60);
			raycastObject = obj;
		}
	}
});

document.addEventListener("wheel", (event) => {
	if (controls.isLocked) {
		if (raycastInterval != undefined) {
			if (event.deltaY > 0) objRotationZ += Math.PI / 4;
			else objRotationZ -= Math.PI / 4;
		}
	}
});

controls.addEventListener('lock', () => {
	blocker.style.display = "none";
});

controls.addEventListener('unlock', () => {
	if (menu.style.display == "none") {
		blocker.style.display = "block";
	}
});

backButton.addEventListener("click", () => {
	document.querySelector(".categoryContainer").style.display = "flex";
	backButton.style.display = "none";
	[...productDivs].map(e => e.style.display = "none");
});

for (let i = 0; i < menuDivs.length; i++) {
	menuDivs[i].addEventListener("click", () => {
		document.querySelector(".categoryContainer").style.display = "none";
		backButton.style.display = "block";
		productDivs[i].style.display = "flex";
	});
}

//#endregion

//#region Functions

//Init
function cameraStartPoint(positionVector = new THREE.Euler(), rotationY = 0) {
	camera.position.setFromEuler(positionVector);

	camera.rotation.y = rotationY;
}

function render() {
	requestIdleCallback(render);

	if (controls.isLocked) {
		movement();
	}
	renderer.render(scene, camera);

	if (isSSAOTurnOn) {
		composer.render();
	}
}

function animate() {
	requestAnimationFrame(animate);

}

//Camera
function movement() {
	var direction = new THREE.Vector3();
	if (keyboardState['KeyW']) direction.z -= 1;
	if (keyboardState['KeyS']) direction.z += 1;
	if (keyboardState['KeyA']) direction.x -= 1;
	if (keyboardState['KeyD']) direction.x += 1;
	/*
	if (keyboardState['Space']) camera.position.y += 1 / 10;
	if (keyboardState['ControlLeft']) camera.position.y -= 1 / 10;
	//*/

	camera.localToWorld(direction)
	direction.sub(camera.position);
	direction.y = 0;
	direction.normalize()
	camera.position.addScaledVector(direction, cameraSpeed);
}

//GUI
function trigerMenu() {
	if (menu.style.display == "none") {
		menu.style.display = "block"
		controls.unlock()
	} else {
		menu.style.display = "none"
		controls.lock()
	}
}

function createProducts() {
	for (let j = 0; j < menuDivs.length; j++) {
		for (let i = 0; i < Object.keys(AllObjects[j]).length; i++) {
			var img = document.createElement("img");
			img.classList.add("productElement");
			img.src = `images/textures/icons/${getLocationToName(Object.values(AllObjects[j])[i])}.png`;
			document.querySelectorAll(".productContainer")[j].appendChild(img);

			img.addEventListener("click", () => {
				if (raycastInterval == undefined) {
					trigerMenu()
					createEntity(Object.values(AllObjects[j])[i]).then((obj) => {
						raycastInterval = setInterval(() => raycastMovement(obj), 1000 / 60);
						raycastObject = obj;
					})
				}
			});
		}
	}
}

//Object

async function createEntity(object) {
	objRotationZ = 0;
	const gltf = await loaderGLTF.loadAsync(object);
	gltf.scene.name = object;
	MyObjects.push(gltf.scene.id);
	scene.add(gltf.scene);
	return gltf.scene;
}

async function createEntity_old(object) {
	const cubeTexture = new THREE.TextureLoader().load(`images/textures/${getLocationToName(object)}.png`);
	const cubeMaterial = new THREE.MeshBasicMaterial({ map: cubeTexture });
	objRotationZ = 0;
	const obj = await new Promise((resolve, reject) => {
		loaderOBJ.load(object,
			(loadedObj) => {
				loadedObj.traverse(function (child) {
					if (child instanceof THREE.Mesh) {
						child.material = cubeMaterial;
						child.name = object;
						resolve(child);
					}
				});
				scene.add(loadedObj);
			},
			undefined,
			reject
		);
	});
	MyObjects.push(obj.id);
	return obj;
}

function getElementbyRaycast(screenPoint) {
	if (controls.isLocked) {
		raycaster.setFromCamera(screenPoint || new THREE.Vector2(), camera);

		var intersects = raycaster.intersectObjects(scene.children)

		return intersects[0].object.parent;
	}
}

function raycastMovement(obj) {
	if (controls.isLocked && obj != undefined && MyObjects.includes(obj.id)) {
		raycaster.setFromCamera(new THREE.Vector2(), camera);
		var intersects = raycaster.intersectObjects(scene.children).filter(e => e.object != obj.getObjectById(e.object.id) && e.distance < 100);

		if (intersects.length > 0) {
			obj.position.set(intersects[0].point.x, intersects[0].point.y, intersects[0].point.z);
			obj.lookAt(intersects[0].point.add(intersects[0].face.normal));
			obj.rotation.z = objRotationZ;
		}
	} else {
		clearInterval(raycastInterval)
		raycastInterval = undefined

		console.info("Raycast is not posible", controls.isLocked, obj != undefined, MyObjects.includes(obj));
	}
}

function getLocationToName(object) { return object.replace(/#|\/models\/1\/|\/models\/2\/|\/models\/3\/|\/models\/4\/|\/models\/5\//g, '').replace(".glb", ""); }

//#endregion

animate()
render()