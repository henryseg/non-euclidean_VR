import {
    Color,
    ThurstonLite,
    trivialSet as trivial,
    Vector,
    PointLight,
    Vector2,
    Cylinder, Isometry, CheckerboardMaterial, phongWrap
} from "../thurstonSph.js";


const thurston = new ThurstonLite(trivial, {keyboard: 'fr'});

thurston.camera.maxDist = 2 * Math.PI;

// lights for the Phong material

//  yellow light
const light0 = new PointLight(
    new Vector(1, 0, 0),
    new Color(1, 1, 0),
);

// cyan light
const light1 = new PointLight(
    new Vector(0, 1, -1),
    new Color(0, 1, 1)
);

// magenta light
const light2 = new PointLight(
    new Vector(-1, -1, 1),
    new Color(1, 0, 1)
);

const checkerboardBase = new CheckerboardMaterial(
    new Vector2(2 * Math.PI, 0),
    new Vector2(0, Math.PI),
    new Color(1, 0.2, 0.2),
    new Color(0, 0, 0)
)

const mat0 = phongWrap(checkerboardBase);


// Complement of a local ball
const cyl = new Cylinder(
    new Isometry(),
    0.1,
    mat0
);


thurston.add(cyl, light0, light1, light2);
thurston.run();
