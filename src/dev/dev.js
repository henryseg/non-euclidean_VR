import {
    Color,
    Vector3,
    Thurston,
    mappingTorusSet as mappingTorus,
    Point,
    ConstDirLight,
    InfoControls,
    Isometry,
    PathTracerWrapMaterial,
    LocalCube,
    CREEPING_FULL,
    phongWrap,
    VaryingColorMaterial
} from "../thurstonSol.js";


mappingTorus.creepingType = CREEPING_FULL;
const thurston = new Thurston(mappingTorus, {keyboard: 'fr', maxBounces: 1});


const lightUp = new ConstDirLight(new Color(1, 1, 1), 0.9, new Vector3(0, 0, 1));
const lightDown = new ConstDirLight(new Color(1, 1, 1), 0.9, new Vector3(0, 0, -1));

const baseMat1 = new VaryingColorMaterial(
    new Color(0.1, 0.2, 0.35),
    new Color(0.2, 0.2, 0.2)
)
const mat1 = phongWrap(baseMat1);
const ptMat1 = new PathTracerWrapMaterial(mat1, {
    emission: new Color(0.25, 0.5, 0.8)
});

const baseMat2 = new VaryingColorMaterial(
    new Color(0.15, 0.1, 0.2),
    new Color(0.2, 0.2, 0.2)
);
const mat2 = phongWrap(baseMat2);
const ptMat2 = new PathTracerWrapMaterial(mat2, {
    emission: new Color(0.25, 0.5, 0.8)
});

const cube1 = new LocalCube(new Isometry(), new Vector3(0.1, 0.1, 0.1), mat1, ptMat1);
// const isom1 = new Isometry().makeTranslation(new Point(0.1,0.05,-0.25, 1));
// const cube1 = new LocalCube(isom1, 0.1, mat1);
const cube2 = new LocalCube(new Isometry().makeTranslation(new Point(0.05, -0.1, 0.15)), new Vector3(0.1, 0.1, 0.1), mat2, ptMat2);

thurston.add(cube1, cube2, lightUp, lightDown);

function info() {
}

const infoControls = new InfoControls()
infoControls.action = info;

thurston.run();
//thurston.renderer.checkShader();