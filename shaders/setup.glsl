Isometry boost; /**< Current boost */
Isometry leftBoost; /**< Left eye boost */
Isometry rightBoost; /**< Right eye boost */
Isometry cellBoost; /**< Cell boost */
Isometry invCellBoost; /**< Inverse of the cell boot */
Isometry objectBoost; /**< objetBoost (model for the template) */

mat4 facing;
mat4 leftFacing;
mat4 rightFacing;

// Declare all the items (solids and lights).
{{#solids}}
  Solid solid{{id}};
{{/solids}}

{{#lights}}
  Light light{{id}};
{{/lights}}

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

    Material objMat0 = Material(vec3(1,1,1),0.5,.5,.5,10.);
    objPos0 = Point(vec4(0,0,-1,1));
    Isometry objBoost0 = makeTranslation(objPos0);
    object0 = createObject(0, objBoost0,mat4(1.),objMat0);
    objects[0] = object0;

    Material objMat1 = Material(vec3(0,0,1),1.,.2,.2,6.);
    objPos1 = Point(vec4(-0.3,0.3,-0.5,1));
    Isometry objBoost1 = makeTranslation(objPos1);
    object1 = createObject(1, objBoost1,mat4(1.),objMat1);
    objects[1] = object1;

    lightPos0 = Point(vec4(1,0,0,1));
    lightPos1 = Point(vec4(0,1,-1,1));
    lightPos2 = Point(vec4(-1,-1,1,1));
    Isometry lightBoost0 = makeTranslation(lightPos0);
    Isometry lightBoost1 = makeTranslation(lightPos1);
    Isometry lightBoost2 = makeTranslation(lightPos2);
    light0 = createLight(0, lightBoost0, mat4(1), vec3(1,1,0));
    light1 = createLight(1, lightBoost1, mat4(1), vec3(0,1,1));
    light2 = createLight(2, lightBoost2, mat4(1), vec3(1,0,1));
    lights[0] = light0;
    lights[1] = light1;
    lights[2] = light2;
}
