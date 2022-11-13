/***********************************************************************************************************************
 * @struct
 * Local rod in Sol
 **********************************************************************************************************************/

struct LocalZAxisShape {
    int id;
    vec4 testX;
    vec4 testY;
    vec4 testZ;
    Isometry absoluteIsomInv;
    float smoothness;
    vec2 sides;
};

/**
 * Distance function for a local rod in Sol
 */
float sdf(LocalZAxisShape a, RelVector v) {
    Point aux = applyIsometry(a.absoluteIsomInv, v.local.pos);
    float x = aux.coords.x;
    float y = aux.coords.y;
    float z = aux.coords.z;

    float distX = asinh((abs(x) - 0.5 * a.sides.x) * exp(-z));
    float distY = asinh((abs(y) - 0.5 * a.sides.y) * exp(z));
    return smoothMaxPoly(distX, distY, a.smoothness);
}

/**
 * Gradient field for a local rod in Sol
 */
RelVector gradient(LocalZAxisShape a, RelVector v){
    Point aux = applyIsometry(a.absoluteIsomInv, v.local.pos);
    float x = aux.coords.x;
    float y = aux.coords.y;
    float z = aux.coords.z;

    float auxX = abs(x) - 0.5 * a.sides.x;
    float auxY = abs(y) - 0.5 * a.sides.y;
    float auxZX = exp(-z);
    float auxZY = exp(z);
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
    Point aux = applyIsometry(a.absoluteIsomInv, v.local.pos);
    float x = aux.coords.x;
    float y = aux.coords.y;
    float z = aux.coords.z;

    float uCoords = atan(y, x);
    float vCoords = z;
    return vec2(uCoords, vCoords);
}