// Basic materials
export {NormalMaterial} from "./normal/NormalMaterial.js";
export {SingleColorMaterial} from "./singleColor/SingleColorMaterial.js";
export {PhongMaterial} from "./phong/PhongMaterial.js";
export {CheckerboardMaterial} from "./checkerboard/CheckerboardMaterial.js";
export {DebugMaterial} from "./debug/DebugMaterial.js";
export {EarthTexture} from "./astronomy/earth/EarthTexture.js";
export {MoonTexture} from "./astronomy/moon/MoonTexture.js";
export {SunTexture} from "./astronomy/sun/SunTexture.js";
export {MarsTexture} from "./astronomy/mars/MarsTexture.js";

// Composite basic materials
export {PhongWrapMaterial, phongWrap} from "./phongWrap/PhongWrapMaterial.js";

// Path tracer material
export {BasicPTMaterial} from "./basicPTMaterial/BasicPTMaterial.js";

// Composite tracer material
export {PathTracerWrapMaterial} from "./pathTracerWrap/PathTracerWrapMaterial.js";