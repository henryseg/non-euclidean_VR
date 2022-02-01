/***********************************************************************************************************************
 * @struct
 * Shape of a local cylinder in Euclidean space
 **********************************************************************************************************************/

struct LocalCylinderShape {
    int id;
    Vector vector;
    float radius;
    Isometry absoluteIsomInv;
};

/**
 * Distance function for a global cylinder
 */
float sdf(LocalCylinderShape cylinder, RelVector v) {
    Point p = cylinder.vector.pos;
    vec4 dir = cylinder.vector.dir;
    vec4 pm = v.local.pos.coords - p.coords;
    vec4 qm = pm - dot(pm, dir) * dir;
    return length(qm) - cylinder.radius;
}

/**
 * Gradient field for a global cylinder
 */
RelVector gradient(LocalCylinderShape cylinder, RelVector v){
    Point p = cylinder.vector.pos;
    vec4 dir = cylinder.vector.dir;
    vec4 pm = v.local.pos.coords - p.coords;
    vec4 qm = pm - dot(pm, dir) * dir;
    Vector local = Vector(v.local.pos, qm);
    local = geomNormalize(local);
    return RelVector(local, v.cellBoost, v.invCellBoost);
}

/**
 * UV map for a global cylinder
 */
vec2 uvMap(LocalCylinderShape cylinder, RelVector v){
    Point m = v.local.pos;
    vec4 pm = m.coords - cylinder.vector.pos.coords;
    pm.w = 0.;
    vec4 pm_pullback = cylinder.absoluteIsomInv.matrix * pm;
    float uCoord = atan(pm_pullback.y, pm_pullback.x);
    float vCoord = pm_pullback.z;
    return vec2(uCoord, vCoord);
}