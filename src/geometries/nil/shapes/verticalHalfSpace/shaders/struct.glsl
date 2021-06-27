/***********************************************************************************************************************
 * @struct
 * Vertical half space
 **********************************************************************************************************************/

struct VerticalHalfSpaceShape {
    Point pos;
    vec3 normal;
    vec3 uDir;
    vec3 vDir;
};

float sdf(VerticalHalfSpaceShape halfSpace, RelVector v) {
    Isometry invCellBoost = toIsometry(v.invCellBoost);
    Point pos = applyGroupElement(v.invCellBoost, halfSpace.pos);
    vec4 diff = v.local.pos.coords - pos.coords;
    vec4 normal = invCellBoost.matrix * vec4(halfSpace.normal, 0);
    return dot(diff.xy, normal.xy);
}

RelVector gradient(VerticalHalfSpaceShape halfSpace, RelVector v) {
    Vector local = Vector(v.local.pos, vec4(halfSpace.normal, 0));
    return RelVector(local, v.cellBoost, v.invCellBoost);
}

vec2 uvMap(VerticalHalfSpaceShape halfSpace, RelVector v) {
    Isometry invCellBoost = toIsometry(v.invCellBoost);
    Point pos = applyGroupElement(v.invCellBoost, halfSpace.pos);
    vec4 uDir = invCellBoost.matrix * vec4(halfSpace.uDir, 0);
    vec4 vDir = invCellBoost.matrix * vec4(halfSpace.vDir, 0);
    float uCoord = dot(v.local.pos.coords - pos.coords, uDir);
    float vCoord = dot(v.local.pos.coords - pos.coords, vDir);
    return vec2(uCoord, vCoord);
}