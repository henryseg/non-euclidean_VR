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
    float dot1 = dot(v.local.pos.coords.xyz, u.pos.coords.xyz);
    float dot2 = dot(v.local.pos.coords.xyz, u.dir.xyz);
    float addDot = min(dot1 * dot1 + dot2 * dot2, 1.);
    float auxH = abs(acos(sqrt(addDot)));
    float auxV = v.local.pos.coords.w - u.pos.coords.w;
    return sqrt(auxH * auxH + auxV * auxV) - cylinder.radius;
}

RelVector gradient(LocalHorizontalCylinderShape cylinder, RelVector v){
    Vector u = cylinder.vector;
    float dot1 = dot(v.local.pos.coords.xyz, u.pos.coords.xyz);
    float dot2 = dot(v.local.pos.coords.xyz, u.dir.xyz);
    float addDot = min(dot1 * dot1 + dot2 * dot2, 1.);
    vec3 projS2 = normalize(dot1 * u.pos.coords.xyz + dot2 * u.dir.xyz);
    vec4 coords = vec4(projS2, u.pos.coords.w);
    Point proj = Point(coords);
    Vector local = direction(v.local.pos, proj);
    local = negate(local);
    local = geomNormalize(local);
    return RelVector(local, v.cellBoost, v.invCellBoost);
}


//vec2 uvMap(LocalHorizontalCylinderShape cylinder, RelVector v){
//    Point m = applyIsometry(v.cellBoost, v.local.pos);
//    vec4 pm = m.coords - cylinder.vector.pos.coords;
//    pm.w = 0.;
//    vec4 pm_pullback = cylinder.absoluteIsomInv.matrix * pm;
//    float uCoord = atan(pm_pullback.y, pm_pullback.x);
//    float vCoord = pm_pullback.z;
//    return vec2(uCoord, vCoord);
//}