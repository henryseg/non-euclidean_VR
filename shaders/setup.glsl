Isometry boost; /**< Current boost */
Isometry leftBoost; /**< Left eye boost */
Isometry rightBoost; /**< Right eye boost */
Isometry cellBoost; /**< Cell boost */
Isometry invCellBoost; /**< Inverse of the cell boot */
Isometry objectBoost; /**< objetBoost (model for the template) */

mat4 facing;
mat4 leftFacing;
mat4 rightFacing;


Object[2] objects;
Light[1] lights;



/**
 * Setup all the boost from the raw data passed to the shader
 */
void unserializeData() {
    boost = unserializeIsom(boostsRawA[0], boostsRawB[0]);
    leftBoost = unserializeIsom(boostsRawA[1], boostsRawB[1]);
    rightBoost = unserializeIsom(boostsRawA[2], boostsRawB[2]);
    cellBoost = unserializeIsom(boostsRawA[3], boostsRawB[3]);
    invCellBoost = unserializeIsom(boostsRawA[4], boostsRawB[4]);

    facing = facings[0];
    leftFacing = facings[1];
    rightFacing = facings[2];

    Material objMat0 = Material(vec3(1,1,0),1.,1.,1.,1.);
    Point objPos0 = Point(vec4(0,0,-1,1));
    Isometry objBoost0 = makeTranslation(objPos0);
    objects[0] = createObject(objBoost0,mat4(1.),objMat0);

    Material objMat1 = Material(vec3(0,1,1),1.,1.,1.,1.);
    Point objPos1 = Point(vec4(0,0.5,-2,1));
    Isometry objBoost1 = makeTranslation(objPos1);
    objects[1] = createObject(objBoost1,mat4(1.),objMat1);
}
