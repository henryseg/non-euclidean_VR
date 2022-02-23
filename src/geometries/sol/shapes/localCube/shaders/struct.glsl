/***********************************************************************************************************************
 * @struct
 * Local cube in Sol
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
 * Distance function for a local cube in Sol
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
}

/**
 * Gradient field for a local cube in Sol
 */
RelVector gradient(LocalCube cube, RelVector v){
    float dotX = dot(v.local.pos.coords, cube.testX);
    float dotY = dot(v.local.pos.coords, cube.testY);
    float dotZ = dot(v.local.pos.coords, cube.testZ);

    float auxX = abs(dotX) - 0.5 * cube.sides.x;
    float auxY = abs(dotY) - 0.5 * cube.sides.y;
    float auxZX = exp(-dotZ);
    float auxZY = exp(dotZ);
    float distX = asinh(auxX * auxZX);
    float distY = asinh(auxY * auxZY);
    float distZ = abs(dotZ) - 0.5 * cube.sides.z;

    float den;
    vec4 dir;

    den = sqrt(auxX * auxX + auxZX * auxZX + 1.);
    dir = (auxZX / den) * (-auxX * cube.testZ + sign(auxX) * cube.testX);
    dir.w = 0.;
    RelVector gradX = RelVector(Vector(v.local.pos, dir), v.cellBoost, v.invCellBoost);

    den = sqrt(auxY * auxY + auxZY * auxZY + 1.);
    dir = (auxZY / den) * (auxY * cube.testZ + sign(auxY) * cube.testY);
    dir.w = 0.;
    RelVector gradY = RelVector(Vector(v.local.pos, dir), v.cellBoost, v.invCellBoost);

    dir = sign(dotZ) * cube.testZ;
    dir.w = 0.;
    RelVector gradZ = RelVector(Vector(v.local.pos, dir), v.cellBoost, v.invCellBoost);

    float distAux = smoothMaxPoly(distX, distY, cube.smoothness);
    RelVector gradAux = gradientMaxPoly(distX, distY, gradX, gradY, cube.smoothness);

    return gradientMaxPoly(distAux, distZ, gradAux, gradZ, cube.smoothness);
}

