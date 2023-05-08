//#region Init
import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { Vector3 } from 'three';

var scene = new THREE.Scene();
		var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
		camera.position.z = 5;

		var renderer = new THREE.WebGLRenderer();
		renderer.setSize( window.innerWidth, window.innerHeight );
		document.body.appendChild( renderer.domElement );

		// Add a cube to the scene
		var geometry = new THREE.BoxGeometry();
		var material = new THREE.MeshBasicMaterial( { color: 0xffffff } );
		var cube = new THREE.Mesh( geometry, material );
		scene.add( cube );

		// Create an SSAO pass
		var ssaoPass = new THREE.SSAOPass( scene, camera );
		ssaoPass.renderToScreen = true;

		// Create a render pass
		var renderPass = new THREE.RenderPass( scene, camera );

		// Add the passes to the effect composer
		var composer = new THREE.EffectComposer( renderer );
		composer.addPass( renderPass );
		composer.addPass( ssaoPass );

		// Render the scene
		function render() {
			requestAnimationFrame( render );
			composer.render();
		}
		render();