/***********************************************************************************************************************
 * @struct
 * Local rod in Sol
 **********************************************************************************************************************/

struct LocalZAxisShape {
    int id;
    Isometry absoluteIsomInv;
    float smoothness;
    vec2 sides;
};

/**
 * Distance function for a local z-axis in Sol
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
 * Gradient field for a local z-axis in Sol
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


    vec4 dirX = sign(x) * vec4(1, 0, - x * auxZX, 0);
    dirX = normalize(dirX);
    RelVector gradX = RelVector(Vector(v.local.pos, dirX), v.cellBoost, v.invCellBoost);

    vec4 dirY = sign(y) * vec4(0, 1, - y * auxZY, 0);
    dirY = normalize(dirY);
    RelVector gradY = RelVector(Vector(v.local.pos, dirY), v.cellBoost, v.invCellBoost);

    return gradientMaxPoly(distX, distY, gradX, gradY, a.smoothness);
}

/*
 * UV map for the z-axis.
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