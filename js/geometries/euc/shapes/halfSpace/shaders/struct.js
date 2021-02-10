// language=GLSL
export default `//
/***********************************************************************************************************************
 * @struct
 * Euclidean half space
 **********************************************************************************************************************/

struct HalfSpaceShape {
    Point pos;
    vec3 normal; /**< Normal to the half space */
    vec3 uDir; /**< Direction of the u-coordinates */
    vec3 vDir; /**< Direction of the v-coordinates */
};

float sdf(HalfSpaceShape halfspace, RelVector v){
    Point pos = applyIsometry(v.invCellBoost, halfspace.pos);
    vec4 normal = v.invCellBoost.matrix * vec4(halfspace.normal, 0);
    return dot(v.local.pos.coords - pos.coords, normal);
}

RelVector gradient(HalfSpaceShape halfspace, RelVector v){
    vec4 normal = v.invCellBoost.matrix * vec4(halfspace.normal, 0);
    Vector local = Vector(v.local.pos, normal);
    return RelVector(local, v.cellBoost, v.invCellBoost);
}

vec2 uvMap(HalfSpaceShape halfspace, RelVector v){
    Point pos = applyIsometry(v.invCellBoost, halfspace.pos);
    vec4 uDir = v.invCellBoost.matrix * vec4(halfspace.uDir, 0);
    vec4 vDir = v.invCellBoost.matrix * vec4(halfspace.vDir, 0);
    float uCoord = dot(v.local.pos.coords - pos.coords, uDir);
    float vCoord = dot(v.local.pos.coords - pos.coords, vDir);
    return vec2(uCoord, vCoord);
}`;

