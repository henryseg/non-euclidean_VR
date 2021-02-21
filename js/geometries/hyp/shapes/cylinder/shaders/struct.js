// language=GLSL
export default `//
/***********************************************************************************************************************
 * @struct
 * Shape of a hyperbolic ball
 **********************************************************************************************************************/

struct CylinderShape {
    int id;
    Vector vector;
    float radius;
};

/**
 * Distance function for a global hyperbolic ball
 */
float sdf(CylinderShape cylinder, RelVector v) {
    Point point = applyIsometry(v.invCellBoost, cylinder.vector.pos);
    vec4 dir = toIsometry(v.invCellBoost).matrix * cylinder.vector.dir;
    float aux0 = hypDot(v.local.pos.coords, point.coords);
    float aux1 = hypDot(v.local.pos.coords, dir);
    return acosh(sqrt(aux0 * aux0 - aux1 * aux1)) - cylinder.radius;
}

/**
 * Gradient field for a global hyperbolic ball
 */
RelVector gradient(CylinderShape cylinder, RelVector v){
    Point point = applyIsometry(v.invCellBoost, cylinder.vector.pos);
    vec4 dir = toIsometry(v.invCellBoost).matrix * cylinder.vector.dir;
    float aux0 = hypDot(v.local.pos.coords, point.coords);
    float aux1 = hypDot(v.local.pos.coords, dir);
    float den = sqrt(aux0 * aux0 - aux1 * aux1);
    vec4 coords = - (aux0 / den) * point.coords + (aux1 / den) * dir;
    Point proj = Point(coords);
    Vector local = direction(v.local.pos, proj);
    local = negate(local);
    local = geomNormalize(local);
    return RelVector(local, v.cellBoost, v.invCellBoost);
}

/**
 * UV Map
 * Note that the section of the (orthonormal) frame bundle that we use here is not invariant under isometries.
 * Hence we have to go back and forth between the local and the global position.
 * Find a better way to do this? 
 */
//vec2 uvMap(CylinderShape cylinder, RelVector v){
//}`;
