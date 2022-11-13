/***********************************************************************************************************************
 * @struct
 * Local x-Axis in Sol
 **********************************************************************************************************************/

struct LocalXAxisShape {
    int id;
    Isometry absoluteIsom;
    Isometry absoluteIsomInv;
    float radius;
};

/**
 * Distance function for a local x-axis in Sol
 */
float sdf(LocalXAxisShape a, RelVector v) {
    Point aux = applyIsometry(a.absoluteIsomInv, v.local.pos);
    float y = aux.coords.y;
    float z = aux.coords.z;
    return acosh(cosh(z) + 0.5 * exp(z) * y * y) - a.radius;
}

/**
 * Gradient for a local x-axis in Sol
 */
RelVector gradient(LocalXAxisShape a, RelVector v){
    Point aux = applyIsometry(a.absoluteIsomInv, v.local.pos);
    float y = aux.coords.y;
    float z = aux.coords.z;

    vec4 dir = vec4(0, y * exp(-z), y * y * exp(z) + 2. * sinh(z), 0);
    dir = a.absoluteIsom.matrix * dir;
    Isometry pull = makeInvTranslation(v.local.pos);
    dir = pull.matrix * dir;
    dir = normalize(dir);

    return RelVector(Vector(v.local.pos, dir), v.cellBoost, v.invCellBoost);
}

/**
 * UV map for a local x-axis in Sol
 */
vec2 uvMap(LocalXAxisShape a, RelVector v){
    Point aux = applyIsometry(a.absoluteIsomInv, v.local.pos);
    float x = aux.coords.x;
    float y = aux.coords.y;
    float z = aux.coords.z;

    float uCoords = atan(y, z);
    float vCoords = x;
    return vec2(uCoords, vCoords);
}