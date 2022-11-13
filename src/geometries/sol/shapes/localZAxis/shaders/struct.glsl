/***********************************************************************************************************************
 * @struct
 * Local rod in Sol
 **********************************************************************************************************************/

struct LocalZAxisShape {
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
float sdf(LocalZAxisShape a, RelVector v) {
    float dotX = dot(v.local.pos.coords, a.testX);
    float dotY = dot(v.local.pos.coords, a.testY);
    float dotZ = dot(v.local.pos.coords, a.testZ);

    float distX = asinh((abs(dotX) - 0.5 * a.sides.x) * exp(-dotZ));
    float distY = asinh((abs(dotY) - 0.5 * a.sides.y) * exp(dotZ));
    return smoothMaxPoly(distX, distY, a.smoothness);
}

/**
 * Gradient field for a local rod in Sol
 */
RelVector gradient(LocalZAxisShape a, RelVector v){
    float dotX = dot(v.local.pos.coords, a.testX);
    float dotY = dot(v.local.pos.coords, a.testY);
    float dotZ = dot(v.local.pos.coords, a.testZ);

    float auxX = abs(dotX) - 0.5 * a.sides.x;
    float auxY = abs(dotY) - 0.5 * a.sides.y;
    float auxZX = exp(-dotZ);
    float auxZY = exp(dotZ);
    float distX = asinh(auxX * auxZX);
    float distY = asinh(auxY * auxZY);

    float den;
    vec4 dir;

    den = sqrt(auxX * auxX + auxZX * auxZX + 1.);
    dir = (auxZX / den) * (-auxX * a.testZ + sign(auxX) * a.testX);
    dir.w = 0.;
    RelVector gradX = RelVector(Vector(v.local.pos, dir), v.cellBoost, v.invCellBoost);

    den = sqrt(auxY * auxY + auxZY * auxZY + 1.);
    dir = (auxZY / den) * (auxY * a.testZ + sign(auxY) * a.testY);
    dir.w = 0.;
    RelVector gradY = RelVector(Vector(v.local.pos, dir), v.cellBoost, v.invCellBoost);

    return gradientMaxPoly(distX, distY, gradX, gradY, a.smoothness);
}

/*
 * UV map for the rod.
 * Just using euclidean cylinder coordinates.
 */
vec2 uvMap(LocalZAxisShape a, RelVector v){
    float dotX = dot(v.local.pos.coords, a.testX);
    float dotY = dot(v.local.pos.coords, a.testY);
    float dotZ = dot(v.local.pos.coords, a.testZ);

    float uCoords = atan(dotY, dotX);
    float vCoords = dotZ;
    return vec2(uCoords, vCoords);
}