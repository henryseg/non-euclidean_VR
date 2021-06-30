/***********************************************************************************************************************
 * @struct
 * Fake ball in Nil
 **********************************************************************************************************************/

struct LocalCube {
    int id;
    vec4 testX;
    vec4 testY;
    vec4 testZ;
    float smoothness;
    vec3 sides;
};

/**
 * Distance function for a global euclidean ball
 */
float sdf(LocalCube cube, RelVector v) {
    float dotX = dot(v.local.pos.coords, cube.testX);
    float dotY = dot(v.local.pos.coords, cube.testY);
    float dotZ = dot(v.local.pos.coords, cube.testZ);

    float distX = asinh((abs(dotX) - 0.5 * cube.sides.x) * exp(-dotZ));
    float distY = asinh((abs(dotY) - 0.5 * cube.sides.y) * exp(dotZ));
    float distZ = abs(dotZ) - 0.5 * cube.sides.z;

    float aux = smoothMaxPoly(distX, distY, cube.smoothness);
    return smoothMaxPoly(aux, distZ, cube.smoothness);
    //    return log(exp(cube.smoothness * distX) + exp(cube.smoothness * distY) + exp(cube.smoothness * distZ)) / cube.smoothness;
    //    return max(max(distX, distY), distZ);
}

///**
// * Gradient field for a global euclidean ball
// */
//RelVector gradient(LocalCube cube, RelVector v){
//    Vector local = Vector(v.local.pos, v.local.pos.coords - ball.center.coords);
//    local = geomNormalize(local);
//    return RelVector(local, v.cellBoost, v.invCellBoost);
//}

