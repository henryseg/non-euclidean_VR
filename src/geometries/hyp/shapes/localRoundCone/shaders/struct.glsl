/***********************************************************************************************************************
 * @struct
 * Shape of a hyperbolic ball
 **********************************************************************************************************************/

struct LocalRoundConeShape {
    int id;
    Vector direction;
    float radius;
    float height;
    vec4 testApex;
};

/**
 * Distance function for a global hyperbolic ball
 */
float sdf(LocalRoundConeShape cone, RelVector v) {
    float distCone, distSphere;
    float distAux;

    vec4 m = v.local.pos.coords;
    float aux0 = hypDot(m, cone.direction.pos.coords);
    float aux1 = hypDot(m, cone.direction.dir);
    vec4 coords = - aux0 * cone.direction.pos.coords + aux1 * cone.direction.dir;
    Point proj = Point(hypNormalize(coords));
    float algDistToCenter = asinh(hypDot(proj.coords, cone.direction.dir));
    float r = cone.radius * (1. - algDistToCenter / cone.height);
    distCone = acosh(sqrt(aux0 * aux0 - aux1 * aux1)) - r;

    distAux = asinh(hypDot(m, cone.testApex));
    distCone = max(distCone, distAux);
    distAux = asinh(hypDot(m, -cone.direction.dir));
    distCone = max(distCone, distAux);

    distSphere = dist(v.local.pos, cone.direction.pos) - cone.radius;
    distAux = asinh(hypDot(m, cone.direction.dir));
    distSphere = max(distSphere, distAux);

    return min(distCone, distSphere);

}

///**
// * Gradient field for a global hyperbolic ball
// */
//RelVector gradient(LocalCappedConeShape cone, RelVector v){
//    Vector local;
//    vec4 m = v.local.pos.coords;
//
//    float aux0 = hypDot(m, cone.direction.pos.coords);
//    float aux1 = hypDot(m, cone.direction.dir);
//    float distCyl = acosh(sqrt(aux0 * aux0 - aux1 * aux1)) - cone.radius;
//    vec4 coords = - aux0 * cone.direction.pos.coords + aux1 * cone.direction.dir;
//    Point proj = Point(hypNormalize(coords));
//    local = direction(v.local.pos, proj);
//    local = negate(local);
//    RelVector gradCyl = RelVector(local, v.cellBoost, v.invCellBoost);
//
//    float distCapTop = asinh(hypDot(m, cone.testCapTop));
//    float distCapBtm = asinh(hypDot(m, cone.testCapBtm));
//    float distCap = max(distCapTop, distCapBtm);
//    if (distCapTop > distCapBtm) {
//        local = Vector(v.local.pos, cone.testCapTop);
//    }
//    else {
//        local = Vector(v.local.pos, cone.testCapBtm);
//    }
//    RelVector gradCap = RelVector(local, v.cellBoost, v.invCellBoost);
//
//    return gradientMaxPoly(distCyl, distCap, gradCyl, gradCap, cone.smoothness);
//}

/**
 * UV Map
 * Note that the section of the (orthonormal) frame bundle that we use here is not invariant under isometries.
 * Hence we have to go back and forth between the local and the global position.
 * Find a better way to do this? 
 */
//vec2 uvMap(CylinderShape cylinder, RelVector v){
//}