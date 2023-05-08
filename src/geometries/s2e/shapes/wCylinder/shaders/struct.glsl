/***********************************************************************************************************************
 * @struct
 * cylinder around the w-axis
 **********************************************************************************************************************/

struct WCylinderShape {
    int id;
    Point origin;
    float radius;
    Isometry absoluteIsomInv;
};

float sdf(WCylinderShape cyl, RelVector v) {
    Point origin = applyGroupElement(v.invCellBoost, cyl.origin);
    float aux = dot(v.local.pos.coords.xyz, origin.coords.xyz);
    return acos(aux) - cyl.radius;
}

RelVector gradient(WCylinderShape cyl, RelVector v){
    vec3 origin = applyGroupElement(v.invCellBoost, cyl.origin).coords.xyz;
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

