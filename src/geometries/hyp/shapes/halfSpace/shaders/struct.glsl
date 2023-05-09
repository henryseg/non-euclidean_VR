/***********************************************************************************************************************
 * @struct
 * Shape of a halfspace
 **********************************************************************************************************************/

struct HalfSpaceShape {
    int id;/**< the id of the shape */
    Vector normal; /**< normal to the boundary of the half space (position and direction) */
    Isometry absoluteIsomInv;
};

/**
 * Distance function for a global hyperbolic halfspace
 */
float sdf(HalfSpaceShape halfspace, RelVector v) {
    Vector normal = applyGroupElement(v.invCellBoost, halfspace.normal);
    float aux = hypDot(v.local.pos.coords, normal.dir);
    return asinh(aux);
}

/**
 * Gradient field for a global hyperbolic halfspace
 */
RelVector gradient(HalfSpaceShape halfspace, RelVector v){
    Vector normal = applyGroupElement(v.invCellBoost, halfspace.normal);
    Vector local = Vector(v.local.pos, normal.dir);
    return RelVector(local, v.cellBoost, v.invCellBoost);
}

// The uv coordinates are the coordinates of the point in the Klein model of the hyperbolic space.
vec2 uvMap(HalfSpaceShape halfspace, RelVector v){
    Point point = applyGroupElement(v.cellBoost, v.local.pos);
    point = applyIsometry(halfspace.absoluteIsomInv, point);
    return point.coords.xy / point.coords.w;
}
