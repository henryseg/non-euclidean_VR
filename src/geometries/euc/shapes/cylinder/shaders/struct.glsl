/***********************************************************************************************************************
 * @struct
 * Shape of a cylinder in Euclidean space
 **********************************************************************************************************************/

struct CylinderShape {
    int id;
    Vector vector;
    float radius;
    Isometry absoluteIsomInv;
};

/**
 * Distance function for a global cylinder
 */
float sdf(CylinderShape cylinder, RelVector v) {
    Point point = applyIsometry(v.invCellBoost, cylinder.vector.pos);
    vec4 dir = toIsometry(v.invCellBoost).matrix * cylinder.vector.dir;
    vec4 pm = v.local.pos.coords - point.coords;
    vec4 qm = pm - dot(pm, dir) * dir;
    return length(qm) - cylinder.radius;
}

/**
 * Gradient field for a global cylinder
 */
RelVector gradient(CylinderShape cylinder, RelVector v){
    Point point = applyIsometry(v.invCellBoost, cylinder.vector.pos);
    vec4 p = point.coords;
    vec4 dir = toIsometry(v.invCellBoost).matrix * cylinder.vector.dir;
    vec4 pm = v.local.pos.coords - point.coords;
    vec4 qm = pm - dot(pm, dir) * dir;
    Vector local = Vector(v.local.pos, qm);
    local = geomNormalize(local);
    return RelVector(local, v.cellBoost, v.invCellBoost);
}

/**
 * UV map for a global cylinder
 */
vec2 uvMap(CylinderShape cylinder, RelVector v){
    Point m = applyIsometry(v.cellBoost, v.local.pos);
    vec4 pm = m.coords - cylinder.vector.pos.coords;
    pm.w = 0.;
    vec4 pm_pullback = cylinder.absoluteIsomInv.matrix * pm;
    float uCoord = pm_pullback.z;
    float vCoord = atan(pm_pullback.y, pm_pullback.x);
    return vec2(uCoord, vCoord);
}