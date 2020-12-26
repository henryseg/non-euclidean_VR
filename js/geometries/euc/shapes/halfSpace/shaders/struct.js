// language=GLSL
export default `//
/***********************************************************************************************************************
 * @struct
 * Euclidean half space
 **********************************************************************************************************************/

struct HalfSpaceShape {
    Point pos;
    vec4 normal;
};

float sdf(HalfSpaceShape halfspace, RelVector v){
    Point pos = applyIsometry(v.invCellBoost, halfspace.pos);
    vec4 normal = v.invCellBoost.matrix * halfspace.normal;
    return dot(v.local.pos.coords - pos.coords, normal);
}

RelVector gradient(HalfSpaceShape halfspace, RelVector v){
    vec4 normal = v.invCellBoost.matrix * halfspace.normal;
    Vector local = Vector(v.local.pos, normal);
    return RelVector(local, v.cellBoost, v.invCellBoost);
}`;