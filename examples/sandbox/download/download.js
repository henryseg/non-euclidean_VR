import {Color} from "three";

import * as geom from "../../../js/geometries/euc/geometry/General.js";
import cube from "../../../js/geometries/euc/groups/freeAbelian/set.js";

import {Point} from "../../../js/geometries/euc/geometry/General.js";
import {PointLight} from "../../../js/geometries/euc/lights/pointLight/PointLight.js";
import {Solid, LocalBall} from "../../../js/geometries/euc/solids/all.js";
import {LocalBallShape, complement} from "../../../js/geometries/euc/shapes/all.js";
import {union} from "../../../js/commons/shapes/all.js";
import {
    BasicPTMaterial,
    PathTracerWrapMaterial,
    PhongWrapMaterial,
    SingleColorMaterial
} from "../../../js/commons/materials/all.js";
import {Thurston} from "../../../js/commons/app/thurston/Thurston.js";
import {VaryingColorMaterial} from "../../../js/geometries/euc/material/varyingColor/VaryingColorMaterial.js";


//------------------------------------------------------------------------------------------------------------------
// General setup
//------------------------------------------------------------------------------------------------------------------

const thurston = new Thurston(geom, cube, {keyboard: 'fr'});


//------------------------------------------------------------------------------------------------------------------
// Building the scene
//------------------------------------------------------------------------------------------------------------------

// lights for the Phong material (not used by the path tracer)

const light0 = new PointLight(
    new Point(1, 0, 0),
    new Color(1, 1, 1),
    0.3
);

const light1 = new PointLight(
    new Point(0, 1, -1),
    new Color(1, 1, 1),
    0.3
);

const light2 = new PointLight(
    new Point(-1, -1, 1),
    new Color(1, 1, 1),
    0.3
);
thurston.add(light0, light1, light2);

// Phong shading material
const latticeColor = new Color(1, 0.2, 0.2);
const latticeBaseMat = new VaryingColorMaterial(
    latticeColor,
    new Color(-0.5, 0.3, 0.3)
)
const latticeMat = new PhongWrapMaterial(latticeBaseMat, {
    color: latticeColor,
    shininess: 5,
});
const ptLatticeMat = new PathTracerWrapMaterial(latticeBaseMat, {
    diffuse: latticeColor,
    specular: latticeColor,
    diffuseChance: 0.98,
    reflectionChance: 0.02,
    refractionChance: 0
});

// Complement of a local ball
const centerBall = new LocalBallShape(
    new Point(0, 0, 0),
    1.3,
);
const vertices = [];
for (let i = 0; i < 8; i++) {
    const i0 = i % 2;
    const i1 = 0.5 * (i - i0) % 2;
    const i2 = 0.25 * (i - 2 * i1 - i0) % 2;
    vertices[i] = new LocalBallShape(
        new Point(2 * i0 - 1, 2 * i1 - 1, 2 * i2 - 1),
        0.5
    );
}

const unionShape = union(centerBall, ...vertices);
const latticeShape = complement(unionShape);
const lattice = new Solid(latticeShape, latticeMat, ptLatticeMat);
thurston.add(lattice);

// Local light (for path tracer only)
const lightColor = new Color(20, 20, 20);
const lightMat = new SingleColorMaterial(lightColor);
const ptLightMat = new BasicPTMaterial({
    emission: lightColor
});
const light = new LocalBall(new Point(-0.2, 0.2, -0.2), 0.1, lightMat, ptLightMat);
thurston.add(light);

thurston.run();

//
// const button = document.getElementById('download');
//
// function onDownload(event) {
//     console.log('toto');
//     ptRenderer.render();
//     button.href = ptRenderer.domElement.toDataURL('image/png', 1);
//     button.download = 'export.png';
// }
//
// button.addEventListener('click', onDownload, false);

