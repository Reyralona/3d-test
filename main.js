import * as THREE from "three";

// controle de órbita
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
// to load 3d models
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

function randomColor() {
  let color = Math.floor(Math.random() * 16777215).toString(16);
  return color;
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}

function createStandardSphere(geo, texture, opacity, transparent, color) {
  const geometry = new THREE.SphereGeometry(geo[0], geo[1], geo[2]);
  const material = new THREE.MeshStandardMaterial({
    map: texture,
    opacity: opacity,
    transparent: transparent,
    color: color,
  });
  const obj = new THREE.Mesh(geometry, material);
  obj.receiveShadow = true;
  obj.castShadow = true;
  return obj;
}

function createBasicSphere(geo, texture, color) {
  const geometry = new THREE.SphereGeometry(geo[0], geo[1], geo[2]);
  const material = new THREE.MeshBasicMaterial({ map: texture, color: color });
  const obj = new THREE.Mesh(geometry, material);
  return obj;
}

function createSphere(geo, color) {
  const geometry = new THREE.SphereGeometry(geo[0], geo[1], geo[2]);
  const material = new THREE.MeshBasicMaterial({ color: color });
  const obj = new THREE.Mesh(geometry, material);
  return obj;
}

// 1. cena
const scene = new THREE.Scene();

// 2. camera
const camera = new THREE.PerspectiveCamera(
  30,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

// 3. renderizador
const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, canvas: document.querySelector("#bg")});
renderer.shadowMap = true;
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000);

const renderScene = new RenderPass(scene, camera)
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.5,
  0.4,
  0.85
)
bloomPass.threshold = 0;
bloomPass.strength = 0.25;
bloomPass.radius = 0;
const bloomComposer = new EffectComposer(renderer);
bloomComposer.setSize(window.innerWidth, window.innerHeight)
bloomComposer.renderToScreen = true;
bloomComposer.addPass(renderScene);
bloomComposer.addPass(bloomPass)

// create stars

for (let i = 0; i < 500; i++) {
  let star = createSphere([0.01, 32, 32], 0xffffff);
  let [x, y, z] = Array(3)
    .fill()
    .map(() => THREE.MathUtils.randFloatSpread(50));
  star.position.set(x, y, z);
  scene.add(star);
}

// const controls = new OrbitControls(camera, renderer.domElement);
// controls.enablePan = false;


const loader = new GLTFLoader();
const earthtexture = new THREE.TextureLoader().load("public/images/earth_day.jpg");
const cloudstexture = new THREE.TextureLoader().load("public/images/earth_clouds.jpg");
const suntexture = new THREE.TextureLoader().load("public/images/sun.jpg");
const moontexture = new THREE.TextureLoader().load("public/images/moon.jpg");

// scene.background = spacetexture
const gridHelper = new THREE.GridHelper(1000, 100);
scene.add(gridHelper);

const sun = createBasicSphere([1.7, 32, 32], suntexture);
scene.add(sun);
const earthorbit = createSphere([1, 0, 0]);
scene.add(earthorbit);
const earth = createStandardSphere([1, 32, 32], earthtexture, 1, false);
earthorbit.add(earth);
const clouds = createStandardSphere([1.01, 32, 32], cloudstexture, 0.5, true);
earth.add(clouds);
const moonorbit = createSphere([1, 0, 0]);
earth.add(moonorbit);
const moon = createStandardSphere([0.3, 32, 32], moontexture, 1, false);
moonorbit.add(moon);
const cameraorbit = createBasicSphere([1, 0, 0])
scene.add(cameraorbit)
cameraorbit.add(camera)

moon.position.x = 2;
earth.position.x = 11;

// move a camera pra longe para não estar dentro do cubo
camera.position.z = 30;
camera.position.y = 12;
camera.position.x = 12;
camera.lookAt(0, 0, 0);

// luzes
const plight = new THREE.PointLight(0xffffff, 200, 500);
scene.add(plight);
const amblight = new THREE.AmbientLight(0xffffff, 0.01);
scene.add(amblight);

const plighthelper = new THREE.PointLightHelper(plight, 1);
scene.add(plighthelper);

window.addEventListener("resize", onWindowResize, false);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  bloomComposer.setSize(window.innerWidth, window.innerHeight)
}

// renderizar a cena
// desenha a cena a cada ~60 segundos. (FPS)

let speed = 1000;

function animate() {
  requestAnimationFrame(animate); 

  earthorbit.rotation.y += 0.001;
  earth.rotation.y += 0.01;
  sun.rotation.y -= 0.008;
  moonorbit.rotation.y += 0.01;
  moon.rotation.y += 0.001;
  cameraorbit.rotation.y -= 0.001;

  renderer.render(scene, camera);
  bloomComposer.render()
}

animate();
