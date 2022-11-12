/***********************************************************************************************************************
 * @struct
 * Local rod in Sol
 **********************************************************************************************************************/

struct LocalRod {
    int id;
    vec4 testX;
    vec4 testY;
    vec4 testZ;
    float smoothness;
    vec2 sides;
};

/**
 * Distance function for a local rod in Sol
 */
float sdf(LocalRod rod, RelVector v) {
    float dotX = dot(v.local.pos.coords, rod.testX);
    float dotY = dot(v.local.pos.coords, rod.testY);
    float dotZ = dot(v.local.pos.coords, rod.testZ);

    float distX = asinh((abs(dotX) - 0.5 * rod.sides.x) * exp(-dotZ));
    float distY = asinh((abs(dotY) - 0.5 * rod.sides.y) * exp(dotZ));
    return smoothMaxPoly(distX, distY, rod.smoothness);
}

/**
 * Gradient field for a local rod in Sol
 */
RelVector gradient(LocalRod rod, RelVector v){
    float dotX = dot(v.local.pos.coords, rod.testX);
    float dotY = dot(v.local.pos.coords, rod.testY);
    float dotZ = dot(v.local.pos.coords, rod.testZ);

    float auxX = abs(dotX) - 0.5 * rod.sides.x;
    float auxY = abs(dotY) - 0.5 * rod.sides.y;
    float auxZX = exp(-dotZ);
    float auxZY = exp(dotZ);
    float distX = asinh(auxX * auxZX);
    float distY = asinh(auxY * auxZY);

    float den;
    vec4 dir;

    den = sqrt(auxX * auxX + auxZX * auxZX + 1.);
    dir = (auxZX / den) * (-auxX * rod.testZ + sign(auxX) * rod.testX);
    dir.w = 0.;
    RelVector gradX = RelVector(Vector(v.local.pos, dir), v.cellBoost, v.invCellBoost);

    den = sqrt(auxY * auxY + auxZY * auxZY + 1.);
    dir = (auxZY / den) * (auxY * rod.testZ + sign(auxY) * rod.testY);
    dir.w = 0.;
    RelVector gradY = RelVector(Vector(v.local.pos, dir), v.cellBoost, v.invCellBoost);

    return gradientMaxPoly(distX, distY, gradX, gradY, rod.smoothness);
}

/*
 * UV map for the rod.
 * Just using euclidean cylinder coordinates.
 */
vec2 uvMap(LocalRod rod, RelVector v){
    float dotX = dot(v.local.pos.coords, rod.testX);
    float dotY = dot(v.local.pos.coords, rod.testY);
    float dotZ = dot(v.local.pos.coords, rod.testZ);

    float uCoords = atan(dotY, dotX);
    float vCoords = dotZ;
    return vec2(uCoords, vCoords);
}