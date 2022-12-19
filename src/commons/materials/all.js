// Basic materials
export {NormalMaterial} from "./normal/NormalMaterial.js";
export {SingleColorMaterial} from "./singleColor/SingleColorMaterial.js";
export {PhongMaterial} from "./phong/PhongMaterial.js";
export {CheckerboardMaterial} from "./checkerboard/CheckerboardMaterial.js";
export {DebugMaterial} from "./debug/DebugMaterial.js";
export {
    earthTexture,
    moonTexture,
    marsTexture,
    sunTexture
} from "./astronomy/astromonyTextures.js";
export {SquaresMaterial} from "./squares/SquaresMaterial.js";
export {StripsMaterial} from "./strips/StripsMaterial.js";

// Composite basic materials
export {PhongWrapMaterial, phongWrap} from "./phongWrap/PhongWrapMaterial.js";

// Path tracer material
export {BasicPTMaterial} from "./basicPTMaterial/BasicPTMaterial.js";

// Composite tracer material
export {PathTracerWrapMaterial, pathTracerWrap} from "./pathTracerWrap/PathTracerWrapMaterial.js";