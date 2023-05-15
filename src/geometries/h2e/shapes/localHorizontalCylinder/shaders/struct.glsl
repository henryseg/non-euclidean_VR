/***********************************************************************************************************************
 * @struct
 * Shape of a horizontal cylinder
 **********************************************************************************************************************/

struct LocalHorizontalCylinderShape {
    int id;
    Vector vector;
    float radius;
    Isometry absoluteIsomInv;
};

float sdf(LocalHorizontalCylinderShape cylinder, RelVector v) {
    Vector u = cylinder.vector;
    float dot1 = hypDot(v.local.pos.coords.xyz, u.pos.coords.xyz);
    float dot2 = hypDot(v.local.pos.coords.xyz, u.dir.xyz);
    float diffDot = max(dot1 * dot1 - dot2 * dot2, 1.);
    float auxH = acosh(sqrt(diffDot));
    float auxV = v.local.pos.coords.w - u.pos.coords.w;
    return sqrt(auxH * auxH + auxV * auxV) - cylinder.radius;
}

//RelVector gradient(LocalHorizontalCylinderShape cylinder, RelVector v){
//    Point point = applyIsometry(v.invCellBoost, cylinder.vector.pos);
//    vec3 q = point.coords.xyz;
//    vec3 p = v.local.pos.coords.xyz;
//    vec3 dir = q + hypDot(p, q) * p;
//    Vector local = Vector(v.local.pos, vec4(-dir, 0));
//    local = geomNormalize(local);
//    return RelVector(local, v.cellBoost, v.invCellBoost);
//}


//vec2 uvMap(LocalHorizontalCylinderShape cylinder, RelVector v){
//    Point m = applyIsometry(v.cellBoost, v.local.pos);
//    vec4 pm = m.coords - cylinder.vector.pos.coords;
//    pm.w = 0.;
//    vec4 pm_pullback = cylinder.absoluteIsomInv.matrix * pm;
//    float uCoord = atan(pm_pullback.y, pm_pullback.x);
//    float vCoord = pm_pullback.z;
//    return vec2(uCoord, vCoord);
//}