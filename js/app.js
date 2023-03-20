import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.126.1/build/three.module.js";

import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.126.1/examples/jsm/loaders/GLTFLoader.js";

import { RGBELoader } from "https://cdn.jsdelivr.net/npm/three@0.126.1/examples/jsm/loaders/RGBELoader.js";

import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.126.1/examples/jsm/controls/OrbitControls.js";

let camera, scene, renderer, Light, floorMat;

let material, material2;

let cubeCamera, cubeRenderTarget;

const container = document.getElementById('app');

camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.5, 100);
camera.position.set(-7, 4, 7);

scene = new THREE.Scene();

Light = new THREE.DirectionalLight(0xffffff, 0.5, 100, 10);

Light.position.set(-5, 2, 0);
Light.castShadow = true;

Light.shadow.mapSize.width = 2048
Light.shadow.mapSize.height = 2048
Light.shadow.camera.near = 1
Light.shadow.camera.far = 20

Light.shadow.camera.top = 7
Light.shadow.camera.left = -7
Light.shadow.camera.right = 7
Light.shadow.camera.bottom = -7

Light.shadow.radius = 3

scene.add(Light);
 
new RGBELoader()
    .load('../files/alps_field_1k.hdr', function (texture) {

        texture.mapping = THREE.EquirectangularReflectionMapping;
        scene.background = texture;
        scene.environment = texture;

    });

const loader = new GLTFLoader();
loader.load("../files/door.glb",
    function (gltf) {

        const model = gltf.scene;
        model.position.set(-2, -0.2, -2);
        model.rotation.set(0, -1, 0);
        model.scale.set(1, 1, 1);

    gltf.scene.traverse( function(node) {

        if ( node.isMesh ) { 
            node.castShadow = true;
        }

    });

    scene.add(model);

});

floorMat = new THREE.MeshStandardMaterial({

color: 0xffffff,
roughness: 1,
metalness: 0

});

material = new THREE.MeshStandardMaterial({

    roughness: 0.8,
    color: 0xffffff,
    bumpScale: 0.012,
    metalness: 0

});

const texture = new THREE.TextureLoader();

texture.load('../files/marble.jpg', function (map) {

    map.wrapS = THREE.RepeatWrapping;
    map.wrapT = THREE.RepeatWrapping;
    map.anisotropy = 5;
    map.encoding = THREE.sRGBEncoding;
    material.map = map;
    material.needsUpdate = true;

});
texture.load('../files/marble-bump.jpg', function (map) {

    map.wrapS = THREE.RepeatWrapping;
    map.wrapT = THREE.RepeatWrapping;
    map.anisotropy = 5;
    material.bumpMap = map;
    material.needsUpdate = true;

});

const floorGeometry = new THREE.PlaneGeometry(40, 40);
const floorMesh = new THREE.Mesh(floorGeometry, floorMat);
floorMesh.receiveShadow = true;
floorMesh.position.set(0, -0.2, 0);
floorMesh.rotation.x = - Math.PI / 2.0;
scene.add(floorMesh);
        
cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256, {

    format: THREE.RGBAFormat,
    type: THREE.FloatType

});

cubeCamera = new THREE.CubeCamera(1, 1000, cubeRenderTarget);

material2 = new THREE.MeshStandardMaterial({

    envMap: cubeRenderTarget.texture,
    roughness: 0.05,
    metalness: 1

});

const ballGeometry = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 8), material2);
ballGeometry.position.set(0, 1.5, 0);
ballGeometry.rotation.y = Math.PI;
ballGeometry.castShadow = true;
ballGeometry.receiveShadow = true;
scene.add(ballGeometry);

const boxGeometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
const boxMesh = new THREE.Mesh(boxGeometry, material);
boxMesh.position.set(2, 0.55, 2);
boxMesh.rotation.y = 10;
boxMesh.castShadow = true;
boxMesh.receiveShadow = true;
scene.add(boxMesh);

renderer = new THREE.WebGLRenderer({antialias: true});
renderer.useLegacyLights = false;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.shadowMap.enabled = true;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement, container);
controls.minDistance = 1;
controls.maxDistance = 20;

window.addEventListener('resize', onWindowResize);

function onWindowResize() {

    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

}

function animate() {

    requestAnimationFrame(animate);

    controls.update()

    render();

}

function render() {

    material2.visible = false;

    cubeCamera.update(renderer, scene);

    material2.visible = true;

    renderer.render(scene, camera);

}

animate();
