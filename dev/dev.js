import {
    Color,
    ThurstonLite,
    cubeSet as cube,
    Vector,
    Point,
    PointLight,
    PhongMaterial,
    LocalBallShape,
    complement,
    union,
    phongWrap,
    Solid,
    LocalHoroballShape,
    PhongWrapMaterial,
    VaryingColorMaterial,
    Isometry,
    CREEPING_FULL,
    LocalRoundCone,
    LocalCappedCylinder,
    GradientColorMaterial, NoiseColorMaterial
} from "../src/3dsHyp.js";


cube.creepingType = CREEPING_FULL;
const thurston = new ThurstonLite(cube, {keyboard: 'fr'});
thurston.renderer.maxBounces = 1;
// thurston.renderer.thurstonParams.postProcess = true;


// lights for the Phong material

//  yellow light
const light0 = new PointLight(
    new Vector(1, 0, 0),
    new Color(1, 1, 1),
);

// cyan light
const light1 = new PointLight(
    new Vector(0, 1, -1),
    new Color(1, 1, 1)
);

// magenta light
const light2 = new PointLight(
    new Vector(-1, -1, 1),
    new Color(1, 1, 1)
);

// Material
const latticeColor = new Color(0.2, 0.5, 0.95);
const latticeBaseMat = new VaryingColorMaterial(
    latticeColor,
    new Color(0.2, 0.2, 0.2)
)
const latticeMat = new PhongWrapMaterial(latticeBaseMat, {
    color: latticeColor,
    shininess: 5,
    reflectivity: new Color(0.3, 0.3, 0.3),
});

// Complement of a local ball
const centerBall = new LocalBallShape(
    new Point(),
    1.02,
);

const modelHalfCube = 1 / Math.sqrt(3);
const horoballs = [];
for (let i = 0; i < 8; i++) {
    const i0 = i % 2;
    const i1 = 0.5 * (i - i0) % 2;
    const i2 = 0.25 * (i - 2 * i1 - i0) % 2;
    horoballs[i] = new LocalHoroballShape(
        new Vector((2 * i0 - 1) * modelHalfCube, (2 * i1 - 1) * modelHalfCube, (2 * i2 - 1) * modelHalfCube),
        0.98
    );
}

const unionShape = union(centerBall, ...horoballs);
const latticeShape = complement(unionShape);
const lattice = new Solid(latticeShape, latticeMat);


const colorCake = new Color('#683928');
const colorCandle = new Color('#E9E5E1');
const colorFlameYellow = new Color('#FED283');
const colorFlameRed = new Color('#CA4C23');

const matCakeBase = new NoiseColorMaterial(
    colorCake,
    new Color(35 / 255, 12 / 255, 2 / 255),
    5
)
const matCake = phongWrap(matCakeBase, {
    specular: 0.01,
    shininess: 0,
});


const matCandle = new PhongMaterial({
    color: colorCandle,
    shininess: 5,
});


const matFlameBase = new GradientColorMaterial(
    colorFlameRed,
    colorFlameYellow,
    0.10,
    0.2
);

const matFlame = phongWrap(matFlameBase, {
    shininess: 1,
    specular: 0.3,
});


const cake = new LocalCappedCylinder(
    new Isometry().makeTranslationFromDir(new Vector(0, 0, -0.1)),
    0.22,
    0.15,
    0.01,
    matCake
);
const candle = new LocalCappedCylinder(
    new Isometry(),
    0.02,
    0.25,
    0.01,
    matCandle
);
const flame = new LocalRoundCone(
    new Isometry().makeTranslationFromDir(new Vector(0, 0, 0.15)),
    0.02,
    0.06,
    matFlame
)


thurston.add(lattice, cake, candle, flame, light0, light1, light2);
thurston.run();