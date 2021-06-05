import {EffectComposer} from "../../js/lib/threejs/examples/jsm/postprocessing/EffectComposer.js";
import {RenderPass} from "../../js/lib/threejs/examples/jsm/postprocessing/RenderPass.js";
import {ShaderPass} from "../../js/lib/threejs/examples/jsm/postprocessing/ShaderPass.js";
import {RGBShiftShader} from "../../js/lib/threejs/examples/jsm/shaders/RGBShiftShader.js";
import {
    LinearFilter,
    RGBAFormat,
    RGBFormat,
    WebGLRenderer,
    WebGLRenderTarget
} from "../../js/lib/threejs/build/three.module.js";
import {TexturePass} from "../../js/lib/threejs/examples/jsm/postprocessing/TexturePass.js";


const shaderPass1 = {

    uniforms: {},
    // language=GLSL
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
    // language=GLSL
    fragmentShader: `
        varying vec2 vUv;

        void main() {
            if (vUv.y <0.5) {
                gl_FragColor = vec4(0, 1, 0, 1);
            } else {
                gl_FragColor = vec4(0, 0, 1, 1);
            }
        }`

};

const shaderPass2 = {

    uniforms: {
        'tDiffuse': {value: null}
    },
    // language=GLSL
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
    // language=GLSL
    fragmentShader: `
        varying vec2 vUv;
        uniform sampler2D tDiffuse;

        void main() {
            if (vUv.x < 0.5) {
                gl_FragColor = vec4(1, 0, 0, 1);
            } else {
                gl_FragColor = texture2D(tDiffuse, vUv);
            }
        }`

};

const rtParameters = {
    minFilter: LinearFilter,
    magFilter: LinearFilter,
    format: RGBAFormat,
    type: THREE.FloatType,
    // stencilBuffer: true
};

const renderer = new WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.autoClear = false;
document.body.appendChild(renderer.domElement);

const target = new WebGLRenderTarget(window.innerWidth, window.innerHeight, rtParameters);
const composer1 = new EffectComposer(renderer, target);
composer1.setSize(window.innerWidth, window.innerHeight);
composer1.setPixelRatio(window.devicePixelRatio);

const pass1 = new ShaderPass(shaderPass1);
composer1.addPass(pass1);
composer1.addPass(new TexturePass(target.texture));


const target2 = new WebGLRenderTarget(window.innerWidth, window.innerHeight, rtParameters);
const composer2 = new EffectComposer(renderer, target2);
composer2.setSize(window.innerWidth, window.innerHeight);
composer2.setPixelRatio(window.devicePixelRatio);

const passTex = new TexturePass(target.texture);
// passTex.uniforms['tDiffuse'].value = composer1.renderTarget2.texture;

const pass2 = new ShaderPass(shaderPass2);
// pass2.uniforms['tDiffuse'].value = composer1.renderTarget2.texture;
composer2.addPass(passTex);
composer2.addPass(pass2);




function animate() {
    requestAnimationFrame(animate);
    composer1.render();
    // composer2.render();
    // renderer.render(scene, camera);
}

animate();