import {
    BoxGeometry, FloatType, LinearFilter, Mesh,
    MeshBasicMaterial,
    PerspectiveCamera, RGBAFormat, RGBFormat,
    Scene, ShaderMaterial, UniformsUtils,
    WebGLRenderer, WebGLRenderTarget
} from "../../js/lib/threejs/build/three.module.js";
import {EffectComposer} from "../../js/lib/threejs/examples/jsm/postprocessing/EffectComposer.js";
import {TexturePass} from "../../js/lib/threejs/examples/jsm/postprocessing/TexturePass.js";
import {ShaderPass} from "../../js/lib/threejs/examples/jsm/postprocessing/ShaderPass.js";
import {FullScreenQuad} from "../../js/lib/threejs/examples/jsm/postprocessing/Pass.js";


const disp = {
    uniforms: {
        'tex': {value: null},
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
        uniform sampler2D tex;
        void main() {
            gl_FragColor = texture2D(tex, vUv);
        }`
};

const mix = {

    uniforms: {
        'accTex': {value: null},
        'newTex': {value: null}
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
        uniform sampler2D accTex;
        uniform sampler2D newTex;
        void main() {
            gl_FragColor = texture2D(accTex, vUv) + texture2D(newTex, vUv);
        }`
};

const scene = new Scene();
const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);


const rtParameters = {
    minFilter: LinearFilter,
    magFilter: LinearFilter,
    format: RGBAFormat,
    type: FloatType,
    // stencilBuffer: true
};
const target = new WebGLRenderTarget(window.innerWidth, window.innerHeight, rtParameters);
let readAcc = new WebGLRenderTarget(window.innerWidth, window.innerHeight, rtParameters);
let writeAcc = new WebGLRenderTarget(window.innerWidth, window.innerHeight, rtParameters);
let tmpAcc;
const renderer = new WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

const mixMat = new ShaderMaterial({
    // defines: Object.assign({}, mix.defines),
    uniforms: UniformsUtils.clone(mix.uniforms),
    vertexShader: mix.vertexShader,
    fragmentShader: mix.fragmentShader
});
const mixQuad = new FullScreenQuad(mixMat);


const dispMat = new ShaderMaterial({
    // defines: Object.assign({}, disp.defines),
    uniforms: UniformsUtils.clone(disp.uniforms),
    vertexShader: disp.vertexShader,
    fragmentShader: disp.fragmentShader
});
const dispQuad = new FullScreenQuad(dispMat);


const geometry = new BoxGeometry();
const material = new MeshBasicMaterial({color: 0x00ff00});
const cube = new Mesh(geometry, material);
scene.add(cube);

camera.position.z = 2;


const animate = function () {
    requestAnimationFrame(animate);

    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    renderer.setRenderTarget(target);
    renderer.render(scene, camera);

    renderer.setRenderTarget(writeAcc);
    mixMat.uniforms['accTex'].value = readAcc.texture;
    mixMat.uniforms['newTex'].value = target.texture;
    mixQuad.render(renderer);

    tmpAcc = readAcc;
    readAcc = writeAcc;
    writeAcc = tmpAcc;

    renderer.setRenderTarget(null);
    dispMat.uniforms['tex'].value = readAcc.texture;
    dispQuad.render(renderer);


};

animate();