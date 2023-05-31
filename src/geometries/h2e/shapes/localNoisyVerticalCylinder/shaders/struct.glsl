/***********************************************************************************************************************
 * @struct
 * Shape of a local vertical cylinder
 **********************************************************************************************************************/

struct LocalNoisyVerticalCylinderShape {
    int id;
    Vector vector;
    float radius;
    Isometry absoluteIsomInv;
};

float sdf(LocalNoisyVerticalCylinderShape cylinder, RelVector v) {
    Point point = cylinder.vector.pos;
    return acosh(-hypDot(v.local.pos.coords, point.coords)) - cylinder.radius;
}

RelVector gradient(LocalNoisyVerticalCylinderShape cylinder, RelVector v){
    Point point = cylinder.vector.pos;
    vec3 q = point.coords.xyz;
    vec3 p = v.local.pos.coords.xyz;
    vec4 dir = -vec4(q + hypDot(p, q) * p,0);

    Point global = applyGroupElement(v.cellBoost, v.local.pos);
    float f1 = fracNoise(0.1 * global.coords.xw);
    float f2 = fracNoise(0.1 * global.coords.yw);

    float f3 = fracNoise(0.5 * global.coords.xw);
    float f4 = fracNoise(0.5 * global.coords.yw);

    vec4 noise = vec4(0.3 * f1 + 0.13 *f3, 0.3 * f1 + 0.13 *f3, 0, 0.3 * f2 + 0.13 *f4);
    dir = dir + noise;
    dir = toIsometry(v.invCellBoost).matrix * dir;
    Vector local = Vector(v.local.pos, dir);
    local = reduceError(local);
    local = geomNormalize(local);
    return RelVector(local, v.cellBoost, v.invCellBoost);
}

//RelVector gradient(LocalVerticalCylinderShape cylinder, RelVector v){
//    Point point = cylinder.vector.pos;
//    vec3 q = point.coords.xyz;
//    vec3 p = v.local.pos.coords.xyz;
//    vec3 dir = q + hypDot(p, q) * p;
//    Vector local = Vector(v.local.pos, vec4(-dir, 0));
//    local = geomNormalize(local);
//    return RelVector(local, v.cellBoost, v.invCellBoost);
//}

/**
 * UV map for a global cylinder
 */
//vec2 uvMap(LocalVerticalCylinderShape cylinder, RelVector v){
//    Point m = applyIsometry(v.cellBoost, v.local.pos);
//    vec4 pm = m.coords - cylinder.vector.pos.coords;
//    pm.w = 0.;
//    vec4 pm_pullback = cylinder.absoluteIsomInv.matrix * pm;
//    float uCoord = atan(pm_pullback.y, pm_pullback.x);
//    float vCoord = pm_pullback.z;
//    return vec2(uCoord, vCoord);
//}