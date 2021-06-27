/***********************************************************************************************************************
 * @struct
 * Shape of a halfspace
 **********************************************************************************************************************/

struct HalfSpaceShape {
    int id;/**< the id of the shape */
    Vector normal; /**< normal to the boundary of the half space (position and direction) */
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
