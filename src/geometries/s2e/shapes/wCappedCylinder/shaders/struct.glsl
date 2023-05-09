/***********************************************************************************************************************
 * @struct
 * cylinder around the w-axis
 **********************************************************************************************************************/

struct WCappedCylinderShape {
    int id;
    float radius;
    float height;
    float smoothness;
    Point center;
    Isometry absoluteIsomInv;
};

float sdf(WCappedCylinderShape cyl, RelVector v) {
    Point center = applyGroupElement(v.invCellBoost, cyl.center);
    // float aux = clamp(dot(v.local.pos.coords.xyz, center.coords.xyz), -1., 1.);
    float aux = dot(v.local.pos.coords.xyz, center.coords.xyz);
    // for some strange reason, the SDF does not work properly, if we remove the absolute value below
    // clamping the dot product between -1 and 1 (as in the commented line above) does not solve the problem.
    float distCyl = abs(acos(aux)) - cyl.radius;
    float distCap = abs(v.local.pos.coords.w - center.coords.w) - 0.5 * cyl.height;
    return smoothMaxPoly(distCyl, distCap, cyl.smoothness);
}

RelVector gradient(WCappedCylinderShape cyl, RelVector v){
    Vector local;

    Point center = applyGroupElement(v.invCellBoost, cyl.center);
    Point pos = v.local.pos;
    float aux = dot(pos.coords.xyz, center.coords.xyz);
    // for some strange reason, the SDF does not work properly, if we remove the absolute value below
    // clamping the dot product between -1 and 1 (as in the commented line above) does not solve the problem.
    float distCyl = abs(acos(aux)) - cyl.radius;
    float distCap = abs(pos.coords.w - center.coords.w) - 0.5 * cyl.height;

    vec3 dirCyl = center.coords.xyz - dot(center.coords.xyz, pos.coords.xyz) * pos.coords.xyz;
    local = Vector(v.local.pos, vec4(-dirCyl, 0));
    local = geomNormalize(local);
    RelVector gradCyl =  RelVector(local, v.cellBoost, v.invCellBoost);

    float sign = sign(cyl.absoluteIsomInv.matrix[3][3] * (pos.coords.w - center.coords.w));
    local = Vector(v.local.pos, vec4(0, 0, 0, sign));
    RelVector gradCap =  RelVector(local, v.cellBoost, v.invCellBoost);

    return gradientMaxPoly(distCyl, distCap, gradCyl, gradCap, cyl.smoothness);
}

