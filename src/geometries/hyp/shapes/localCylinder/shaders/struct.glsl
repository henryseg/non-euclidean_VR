/***********************************************************************************************************************
 * @struct
 * Shape of a hyperbolic ball
 **********************************************************************************************************************/

struct LocalCylinderShape {
    int id;
    Vector direction;
    float radius;
};

/**
 * Distance function for a global hyperbolic ball
 */
float sdf(LocalCylinderShape cyl, RelVector v) {
    float aux0 = hypDot(v.local.pos.coords, cyl.direction.pos.coords);
    float aux1 = hypDot(v.local.pos.coords, cyl.direction.dir);
    return acosh(sqrt(aux0 * aux0 - aux1 * aux1)) - cyl.radius;
}

/**
 * Gradient field for a global hyperbolic ball
 */
RelVector gradient(LocalCylinderShape cyl, RelVector v){
    float aux0 = hypDot(v.local.pos.coords, cyl.direction.pos.coords);
    float aux1 = hypDot(v.local.pos.coords, cyl.direction.dir);
    vec4 coords = - aux0 * cyl.direction.pos.coords + aux1 * cyl.direction.dir;
    Point proj = Point(hypNormalize(coords));
    Vector local = direction(v.local.pos, proj);
    local = negate(local);
    return RelVector(local, v.cellBoost, v.invCellBoost);
}

/**
 * UV Map
 * Note that the section of the (orthonormal) frame bundle that we use here is not invariant under isometries.
 * Hence we have to go back and forth between the local and the global position.
 * Find a better way to do this? 
 */
//vec2 uvMap(CylinderShape cylinder, RelVector v){
//}
