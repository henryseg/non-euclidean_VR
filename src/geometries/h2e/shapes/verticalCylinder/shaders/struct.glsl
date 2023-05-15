/***********************************************************************************************************************
 * @struct
 * Shape of a vertical cylinder
 **********************************************************************************************************************/

struct VerticalCylinderShape {
    int id;
    Vector vector;
    float radius;
    Isometry absoluteIsomInv;
};

/**
 * Distance function for a global cylinder
 */
float sdf(VerticalCylinderShape cylinder, RelVector v) {
    Point point = applyIsometry(v.invCellBoost, cylinder.vector.pos);
    return acosh(-hypDot(v.local.pos.coords, point.coords)) - cylinder.radius;
}

/**
 * Gradient field for a global cylinder
 */
RelVector gradient(VerticalCylinderShape cylinder, RelVector v){
    Point point = applyIsometry(v.invCellBoost, cylinder.vector.pos);
    vec3 q = point.coords.xyz;
    vec3 p = v.local.pos.coords.xyz;
    vec3 dir = q + hypDot(p, q) * p;
    Vector local = Vector(v.local.pos, vec4(-dir, 0));
    local = geomNormalize(local);
    return RelVector(local, v.cellBoost, v.invCellBoost);
}

/**
 * UV map for a global cylinder
 */
//vec2 uvMap(VerticalCylinderShape cylinder, RelVector v){
//    Point m = applyIsometry(v.cellBoost, v.local.pos);
//    vec4 pm = m.coords - cylinder.vector.pos.coords;
//    pm.w = 0.;
//    vec4 pm_pullback = cylinder.absoluteIsomInv.matrix * pm;
//    float uCoord = atan(pm_pullback.y, pm_pullback.x);
//    float vCoord = pm_pullback.z;
//    return vec2(uCoord, vCoord);
//}