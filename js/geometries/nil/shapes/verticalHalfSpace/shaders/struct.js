// language=GLSL
export default `//

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

float sdf(VerticalHalfSpaceShape halfSpace, ExtVector v) {
    Point pos = applyIsometry(v.invCellBoost, halfSpace.pos);
    vec4 normal = v.invCellBoost.matrix * vec4(halfSpace.normal, 0);
    vec4 diff = v.local.pos.coords - pos.coords;
    return dot(diff, normal);
}

ExtVector gradient(VerticalHalfSpaceShape halfSpace, ExtVector v) {
    Vector local = Vector(v.local.pos, vec4(halfSpace.normal, 0));
    return ExtVector(local, v.cellBoost, v.invCellBoost);
}

vec2 uvMap(VerticalHalfSpaceShape halfSpace, ExtVector v) {
    Point pos = applyIsometry(v.invCellBoost, halfSpace.pos);
    vec4 uDir = v.invCellBoost.matrix * vec4(halfSpace.uDir, 0);
    vec4 vDir = v.invCellBoost.matrix * vec4(halfSpace.vDir, 0);
    float uCoord = dot(v.local.pos.coords - pos.coords, uDir);
    float vCoord = dot(v.local.pos.coords - pos.coords, vDir);
    return vec2(uCoord, vCoord);
}`;