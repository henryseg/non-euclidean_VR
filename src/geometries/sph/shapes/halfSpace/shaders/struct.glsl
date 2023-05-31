/***********************************************************************************************************************
 * @struct
 * Shape of a spherical ball
 **********************************************************************************************************************/

struct HalfSpaceShape {
    int id;
    Vector normal;
    Isometry absoluteIsomInv;
};

/**
 * Distance function for a global hyperbolic ball
 */
float sdf(HalfSpaceShape halfspace, RelVector v) {
    Vector normal = applyGroupElement(v.invCellBoost, halfspace.normal);
    float aux = dot(v.local.pos.coords, normal.dir);
    return asin(aux);
}

/**
 * Gradient field for a global hyperbolic ball
 */
RelVector gradient(HalfSpaceShape halfspace, RelVector v){
    Vector normal = applyGroupElement(v.invCellBoost, halfspace.normal);
    Vector local = Vector(v.local.pos, normal.dir);
    return RelVector(local, v.cellBoost, v.invCellBoost);
}

vec2 uvMap(HalfSpaceShape halfspace, RelVector v){
    Point point = applyGroupElement(v.cellBoost, v.local.pos);
    point = applyIsometry(halfspace.absoluteIsomInv, point);
    vec3 aux = normalize(point.coords.xyw);
    float sinPhi = length(aux.xy);
    float cosPhi = aux.z;
    float uCoord = atan(aux.y, aux.x);
    float vCoord = atan(sinPhi, cosPhi);
    return vec2(uCoord, vCoord);
}
