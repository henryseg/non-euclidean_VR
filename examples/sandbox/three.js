import * as THREE from "../../js/lib/threejs/build/three.module.js";
import {EffectComposer} from "../../js/lib/threejs/examples/jsm/postprocessing/EffectComposer.js";
import {RenderPass} from "../../js/lib/threejs/examples/jsm/postprocessing/RenderPass.js";
import {ShaderPass} from "../../js/lib/threejs/examples/jsm/postprocessing/ShaderPass.js";
import {RGBShiftShader} from "../../js/lib/threejs/examples/jsm/shaders/RGBShiftShader.js";


// language=GLSL
const vertexShader = `//
void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

// language=GLSL
const fragmentShader = `//

uniform vec2 resolution;

void main() {
    if (gl_FragCoord.x/resolution.x < 0.5){
        gl_FragColor = vec4(1, 0, 0, 1);
    }
    else {
        gl_FragColor = vec4(0, 0, 1, 1);
    }

}
`;


const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 10);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const geometry = new THREE.PlaneGeometry(2, 2);
geometry.translate(0, 0, -1);
const material = new THREE.ShaderMaterial({
    uniforms: {
        resolution: new THREE.Uniform(new THREE.Vector2(window.innerWidth, window.innerHeight))
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
});

// const material = new THREE.MeshBasicMaterial({color: 0x00ff00});
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

const effect2 = new ShaderPass( RGBShiftShader );
effect2.uniforms[ 'amount' ].value = 0.0015;

function animate() {
    requestAnimationFrame(animate);
    composer.render();
    // renderer.render(scene, camera);
}

animate();