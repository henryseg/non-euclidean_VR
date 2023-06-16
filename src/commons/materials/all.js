// Basic materials
export {NormalMaterial} from "./normal/NormalMaterial.js";
export {SingleColorMaterial} from "./singleColor/SingleColorMaterial.js";
export {PhongMaterial} from "./phong/PhongMaterial.js";
export {CheckerboardMaterial} from "./checkerboard/CheckerboardMaterial.js";
export {GraphPaperMaterial} from "./graphPaper/GraphPaperMaterial.js";
export {DebugMaterial} from "./debug/DebugMaterial.js";
export {SimpleTextureMaterial} from "./simpleTexture/SimpleTextureMaterial";
export {RotatedSphericalTextureMaterial} from "./rotatedSphericalTexture/RotatedSphericalTextureMaterial.js";
export {
    earthTexture,
    moonTexture,
    marsTexture,
    sunTexture
} from "./astronomy/astromonyTextures.js";
export {woodBallMaterial} from "./woodBall/woodballsMaterials";
export {VideoTextureMaterial} from "./videoTexture/VideoTextureMaterial";
export {VideoAlphaTextureMaterial} from "./videoAlphaTexture/VideoAlphaTextureMaterial";
export {VideoFrameTextureMaterial} from "./videoFrameTexture/VideoFrameTextureMaterial";
export {SquaresMaterial} from "./squares/SquaresMaterial.js";
export {StripsMaterial} from "./strips/StripsMaterial.js";
export {HypStripsMaterial} from "./hypStrips/HypStripsMaterial.js";
export {EquidistantSphStripsMaterial} from "./equidistantSphStrips/EquidistantSphStripsMaterial.js";
export {EquidistantHypStripsMaterial} from "./equidistantHypStrips/EquidistantHypStripsMaterial.js";
export {
    ImprovedEquidistantHypStripsMaterial
} from "./improvedEquidistantHypStrips/ImprovedEquidistantHypStripsMaterial.js";

// Composite basic materials
export {PhongWrapMaterial, phongWrap} from "./phongWrap/PhongWrapMaterial.js";
export {HighlightWrapMaterial, highlightWrap} from "./highlightWrap/HighlightWrapMaterial.js";
export {HighlightLocalWrapMaterial, highlightLocalWrap} from "./highlightLocalWrap/HighlightLocalWrapMaterial.js";
export {TransitionWrapMaterial, transitionWrap} from "./transitionWrap/TransitionWrapMaterial.js";
export {TransitionLocalWrapMaterial, transitionLocalWrap} from "./transitionLocalWrap/TransitionLocalWrapMaterial.js";

// Path tracer material
export {BasicPTMaterial} from "./basicPTMaterial/BasicPTMaterial.js";

// Composite tracer material
export {PathTracerWrapMaterial, pathTracerWrap} from "./pathTracerWrap/PathTracerWrapMaterial.js";
