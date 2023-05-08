/***********************************************************************************************************************
 * @struct
 * cylinder around the w-axis
 **********************************************************************************************************************/

struct WCylinderShape {
    int id;
    float radius;
    Point center;
    Isometry absoluteIsomInv;
};

float sdf(WCylinderShape cyl, RelVector v) {
    Point center = applyGroupElement(v.invCellBoost, cyl.center);
    // float aux = clamp(dot(v.local.pos.coords.xyz, center.coords.xyz), -1., 1.);
    float aux = dot(v.local.pos.coords.xyz, center.coords.xyz);
    // for some strange reason, the SDF does not work properly, if we remove the absolute value below
    // clamping the dot product between -1 and 1 (as in the commented line above) does not solve the problem.
    return abs(acos(aux)) - cyl.radius;
}

RelVector gradient(WCylinderShape cyl, RelVector v){
    vec3 origin = applyGroupElement(v.invCellBoost, cyl.center).coords.xyz;
    vec3 pos = v.local.pos.coords.xyz;
    vec3 aux = origin - dot(origin, pos) * pos;
    Vector local = Vector(v.local.pos, vec4(-aux, 0));
    local = geomNormalize(local);
    return RelVector(local, v.cellBoost, v.invCellBoost);
}

vec2 uvMap(WCylinderShape cyl, RelVector v){
    Point m = applyGroupElement(v.cellBoost, v.local.pos);
    m = applyIsometry(cyl.absoluteIsomInv, m);
    vec3 dir = m.coords.xyz - dot(m.coords.xyz, ORIGIN.coords.xyz) * ORIGIN.coords.xyz;
    float uCoord = -atan(dir.y, dir.x);
    float vCoord = m.coords.w;
    return vec2(uCoord, vCoord);
}

