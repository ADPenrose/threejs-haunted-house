import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import GUI from 'lil-gui';

/**
 * Base
 */
// Debug
// const gui = new GUI();

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

// Fog
const fog = new THREE.Fog('#262827', 1, 15);
scene.fog = fog;

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader();
// Door textures
// I need to set the color space to SRGB, so the colors look as they should.
// This only needs to be added on textures that will be used as map or matcap.
const doorColorTexture = textureLoader.load('/textures/door/color.jpg');
doorColorTexture.colorSpace = THREE.SRGBColorSpace;
const doorAlphaTexture = textureLoader.load('/textures/door/alpha.jpg');
const doorAmbientOcclusionTexture = textureLoader.load(
	'/textures/door/ambientOcclusion.jpg'
);
const doorHeightTexture = textureLoader.load('/textures/door/height.jpg');
const doorNormalTexture = textureLoader.load('/textures/door/normal.jpg');
const doorMetalnessTexture = textureLoader.load('/textures/door/metalness.jpg');
const doorRoughnessTexture = textureLoader.load('/textures/door/roughness.jpg');

// Walls textures
const bricksColorTexture = textureLoader.load('/textures/bricks/color.jpg');
bricksColorTexture.colorSpace = THREE.SRGBColorSpace;
const bricksAmbientOcclusionTexture = textureLoader.load(
	'/textures/bricks/ambientOcclusion.jpg'
);
const bricksNormalTexture = textureLoader.load('/textures/bricks/normal.jpg');
const bricksRoughnessTexture = textureLoader.load(
	'/textures/bricks/roughness.jpg'
);

// Grass textures
const grassColorTexture = textureLoader.load('/textures/grass/color.jpg');
grassColorTexture.colorSpace = THREE.SRGBColorSpace;
const grassAmbientOcclusionTexture = textureLoader.load(
	'/textures/grass/ambientOcclusion.jpg'
);
const grassNormalTexture = textureLoader.load('/textures/grass/normal.jpg');
const grassRoughnessTexture = textureLoader.load(
	'/textures/grass/roughness.jpg'
);
// I need to change the repeat prop on the grass texture, so it's not too big.
// First, we need to tell each texture to repeat.
// Repeat on x axis.
grassColorTexture.wrapS = THREE.RepeatWrapping;
grassAmbientOcclusionTexture.wrapS = THREE.RepeatWrapping;
grassNormalTexture.wrapS = THREE.RepeatWrapping;
grassRoughnessTexture.wrapS = THREE.RepeatWrapping;
// Repeat on y axis.
grassColorTexture.wrapT = THREE.RepeatWrapping;
grassAmbientOcclusionTexture.wrapT = THREE.RepeatWrapping;
grassNormalTexture.wrapT = THREE.RepeatWrapping;
grassRoughnessTexture.wrapT = THREE.RepeatWrapping;
// Now we can set the repeat prop.
grassColorTexture.repeat.set(8, 8);
grassAmbientOcclusionTexture.repeat.set(8, 8);
grassNormalTexture.repeat.set(8, 8);
grassRoughnessTexture.repeat.set(8, 8);

/**
 * House
 */
// I'm going to create a group to hold all the objects that make up the house.
const house = new THREE.Group();
scene.add(house);

// Walls
const walls = new THREE.Mesh(
	new THREE.BoxGeometry(4, 2.5, 4),
	new THREE.MeshStandardMaterial({
		map: bricksColorTexture,
		aoMap: bricksAmbientOcclusionTexture,
		normalMap: bricksNormalTexture,
		roughnessMap: bricksRoughnessTexture,
	})
);
walls.position.y = 2.5 / 2;
// Adding the walls to the house group, not the scene.
house.add(walls);

// Roof
const roof = new THREE.Mesh(
	new THREE.ConeGeometry(3.5, 1, 4),
	new THREE.MeshStandardMaterial({ color: '#b35f45' })
);
roof.position.y = 2.5 + 1 / 2;
roof.rotation.y = Math.PI * 0.25;
house.add(roof);

// Door
const door = new THREE.Mesh(
	// There are lots of subdivisions, so the displacement map looks better.
	new THREE.PlaneGeometry(2.2, 2.2, 100, 100),
	new THREE.MeshStandardMaterial({
		// The main texture.
		map: doorColorTexture,
		// The alpha map, which will make the door transparent where the texture is
		// black.
		transparent: true,
		alphaMap: doorAlphaTexture,
		// The ambient occlusion map, which will make the door darker in the
		// corners.
		aoMap: doorAmbientOcclusionTexture,
		// The displacement map, which will make the door look like it has depth.
		// I'm also setting the displacement scale to 0.1, so it's not too
		// pronounced.
		displacementMap: doorHeightTexture,
		displacementScale: 0.1,
		// The normal map allows us to add the illusion of more details related
		// to lighting.
		normalMap: doorNormalTexture,
		// Adding the metalness and roughness maps to make the door look more
		// realistic.
		metalnessMap: doorMetalnessTexture,
		roughnessMap: doorRoughnessTexture,
	})
);
door.position.z = 2 + 0.01;
door.position.y = 1;
house.add(door);

// Bushes
// Since all of them are the same, I can reuse the same geometry and material.
const bushGeometry = new THREE.SphereGeometry(1, 16, 16);
const bushMaterial = new THREE.MeshStandardMaterial({ color: '#89c854' });

// Bush 1
const bush1 = new THREE.Mesh(bushGeometry, bushMaterial);
bush1.position.set(0.8, 0.2, 2.2);
bush1.scale.set(0.5, 0.5, 0.5);

// Bush 2
const bush2 = new THREE.Mesh(bushGeometry, bushMaterial);
bush2.position.set(1.4, 0.1, 2.1);
bush2.scale.set(0.25, 0.25, 0.25);

// Bush 3
const bush3 = new THREE.Mesh(bushGeometry, bushMaterial);
bush3.position.set(-0.8, 0.1, 2.2);
bush3.scale.set(0.4, 0.4, 0.4);

// Bush 4
const bush4 = new THREE.Mesh(bushGeometry, bushMaterial);
bush4.position.set(-1, 0.05, 2.6);
bush4.scale.set(0.15, 0.15, 0.15);

house.add(bush1, bush2, bush3, bush4);

// Graves
// Since I want to generate them programatically, I'm going to create their own
// group.
const graves = new THREE.Group();
scene.add(graves);

const graveGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.2);
const graveMaterial = new THREE.MeshStandardMaterial({ color: '#b2b6b1' });

// Here's the loop.
for (let i = 0; i < 50; i++) {
	// We need an angle, which we will use to position the graves in a circle.
	const angle = Math.random() * Math.PI * 2;
	// We also need a radius, which will go from 3 to 6. This way, the graves
	// will not be neither too close nor too far from the house.
	const radius = 3 + Math.random() * 6;
	// Now, to place them in a circle around the house, we can use the sine and
	// cosine on the x and z axes.
	const x = Math.sin(angle) * radius;
	const z = Math.cos(angle) * radius;

	// Now we can create the mesh and position it.
	const grave = new THREE.Mesh(graveGeometry, graveMaterial);
	grave.position.set(x, 0.3, z);
	// We can also rotate them randomly, so they don't look all the same.
	// I like to use Math.random() - 0.5 to get a random number between -0.5 and
	// 0.5, and then scale that.
	grave.rotation.y = (Math.random() - 0.5) * 0.4;
	grave.rotation.z = (Math.random() - 0.5) * 0.4;
	// Each grave should cast a shadow.
	grave.castShadow = true;
	graves.add(grave);
}

// Floor
const floor = new THREE.Mesh(
	new THREE.PlaneGeometry(20, 20),
	new THREE.MeshStandardMaterial({
		map: grassColorTexture,
		aoMap: grassAmbientOcclusionTexture,
		normalMap: grassNormalTexture,
		roughnessMap: grassRoughnessTexture,
	})
);
floor.rotation.x = -Math.PI * 0.5;
floor.position.y = 0;
scene.add(floor);

/**
 * Lights
 */
// Ambient light
const ambientLight = new THREE.AmbientLight('#b0d5ff', 0.12);
// gui.add(ambientLight, 'intensity').min(0).max(1).step(0.001);
scene.add(ambientLight);

// Directional light
const moonLight = new THREE.DirectionalLight('#b0d5ff', 0.26);
moonLight.position.set(4, 5, -2);
// gui.add(moonLight, 'intensity').min(0).max(1).step(0.001);
// gui.add(moonLight.position, 'x').min(-5).max(5).step(0.001);
// gui.add(moonLight.position, 'y').min(-5).max(5).step(0.001);
// gui.add(moonLight.position, 'z').min(-5).max(5).step(0.001);
scene.add(moonLight);

// Door light
const doorLight = new THREE.PointLight('#ff7d46', 3, 7);
doorLight.position.set(0, 2.2, 2.7);
// This is part of the house, so we add it to the house group.
house.add(doorLight);

// Ghosts
const ghost1 = new THREE.PointLight('#ff00ff', 6, 3);
scene.add(ghost1);
const ghost2 = new THREE.PointLight('#00ffff', 6, 3);
scene.add(ghost2);
const ghost3 = new THREE.PointLight('#ffff00', 6, 3);
scene.add(ghost3);

/**
 * Sizes
 */
const sizes = {
	width: window.innerWidth,
	height: window.innerHeight,
};

window.addEventListener('resize', () => {
	// Update sizes
	sizes.width = window.innerWidth;
	sizes.height = window.innerHeight;

	// Update camera
	camera.aspect = sizes.width / sizes.height;
	camera.updateProjectionMatrix();

	// Update renderer
	renderer.setSize(sizes.width, sizes.height);
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
	75,
	sizes.width / sizes.height,
	0.1,
	100
);
camera.position.x = 4;
camera.position.y = 2;
camera.position.z = 5;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
	canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
// We need to set the clear color to the same color as the fog, so it looks
// seamless.
renderer.setClearColor('#262827');

// Activating shadows.
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
// These objects will cast shadows.
moonLight.castShadow = true;
doorLight.castShadow = true;
ghost1.castShadow = true;
ghost2.castShadow = true;
ghost3.castShadow = true;
walls.castShadow = true;
bush1.castShadow = true;
bush2.castShadow = true;
bush3.castShadow = true;
// These objects will receive shadows.
floor.receiveShadow = true;

// Some optmizations for the shadows. These will make the shadows look better.
doorLight.shadow.mapSize.width = 256;
doorLight.shadow.mapSize.height = 256;
doorLight.shadow.camera.far = 7;

ghost1.shadow.mapSize.width = 256;
ghost1.shadow.mapSize.height = 256;
ghost1.shadow.camera.far = 7;

ghost2.shadow.mapSize.width = 256;
ghost2.shadow.mapSize.height = 256;
ghost2.shadow.camera.far = 7;

ghost3.shadow.mapSize.width = 256;
ghost3.shadow.mapSize.height = 256;
ghost3.shadow.camera.far = 7;

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
	const elapsedTime = clock.getElapsedTime();

	// Ghosts
	const ghost1Angle = elapsedTime * 0.5;
	ghost1.position.x = Math.cos(ghost1Angle) * 4;
	ghost1.position.z = Math.sin(ghost1Angle) * 4;
	ghost1.position.y = Math.sin(elapsedTime * 3);

	const ghost2Angle = -elapsedTime * 0.3;
	ghost2.position.x = Math.cos(ghost2Angle) * 5;
	ghost2.position.z = Math.sin(ghost2Angle) * 5;
	// Two sine waves give us more randomness.
	ghost2.position.y = Math.sin(elapsedTime * 4) + Math.sin(elapsedTime * 2.5);

	const ghost3Angle = -elapsedTime * 0.18;
	ghost3.position.x =
		Math.cos(ghost3Angle) * (7 + Math.sin(elapsedTime * 0.32));
	ghost3.position.z = Math.sin(ghost3Angle) * (7 + Math.sin(elapsedTime * 0.5));
	ghost3.position.y = Math.sin(elapsedTime * 3) + Math.sin(elapsedTime * 2);

	// Update controls
	controls.update();

	// Render
	renderer.render(scene, camera);

	// Call tick again on the next frame
	window.requestAnimationFrame(tick);
};

tick();
