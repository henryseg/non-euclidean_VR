/***********************************************************************************************************************
 * @struct
 * Shape of a hyperbolic ball
 **********************************************************************************************************************/

struct LocalCappedCylinderShape {
    int id;
    Vector direction;
    float radius;
    vec4 testCapTop;
    vec4 testCapBtm;
    float smoothness;
};

/**
 * Distance function for a global hyperbolic ball
 */
float sdf(LocalCappedCylinderShape cyl, RelVector v) {
    vec4 m = v.local.pos.coords;
    float aux0 = hypDot(m, cyl.direction.pos.coords);
    float aux1 = hypDot(m, cyl.direction.dir);
    vec4 coords = - aux0 * cyl.direction.pos.coords + aux1 * cyl.direction.dir;
    float distCyl = acosh(sqrt(aux0 * aux0 - aux1 * aux1)) - cyl.radius;

    float distCapTop = asinh(hypDot(m, cyl.testCapTop));
    float distCapBtm = asinh(hypDot(m, cyl.testCapBtm));
    float distCap = max(distCapTop, distCapBtm);
    return smoothMaxPoly(distCyl, distCap, cyl.smoothness);

}

/**
 * Gradient field for a global hyperbolic ball
 */
RelVector gradient(LocalCappedCylinderShape cyl, RelVector v){
    Vector local;
    vec4 m = v.local.pos.coords;

    float aux0 = hypDot(m, cyl.direction.pos.coords);
    float aux1 = hypDot(m, cyl.direction.dir);
    float distCyl = acosh(sqrt(aux0 * aux0 - aux1 * aux1)) - cyl.radius;
    vec4 coords = - aux0 * cyl.direction.pos.coords + aux1 * cyl.direction.dir;
    Point proj = Point(hypNormalize(coords));
    local = direction(v.local.pos, proj);
    local = negate(local);
    RelVector gradCyl = RelVector(local, v.cellBoost, v.invCellBoost);

    float distCapTop = asinh(hypDot(m, cyl.testCapTop));
    float distCapBtm = asinh(hypDot(m, cyl.testCapBtm));
    float distCap = max(distCapTop, distCapBtm);
    if (distCapTop > distCapBtm) {
        local = Vector(v.local.pos, cyl.testCapTop);
    }
    else {
        local = Vector(v.local.pos, cyl.testCapBtm);
    }
    RelVector gradCap = RelVector(local, v.cellBoost, v.invCellBoost);

    return gradientMaxPoly(distCyl, distCap, gradCyl, gradCap, cyl.smoothness);
}

/**
 * UV Map
 * Note that the section of the (orthonormal) frame bundle that we use here is not invariant under isometries.
 * Hence we have to go back and forth between the local and the global position.
 * Find a better way to do this? 
 */
//vec2 uvMap(CylinderShape cylinder, RelVector v){
//}
