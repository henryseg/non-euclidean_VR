// language=GLSL
export default `//

/***********************************************************************************************************************
 * @struct
 * Vertical half space
 **********************************************************************************************************************/

struct VerticalHalfSpaceShape {
    Point pos;
    vec4 normal;
};

float sdf(VerticalHalfSpaceShape halfSpace, RelVector v) {
    Point pos = applyIsometry(v.invCellBoost, halfSpace.pos);
    vec4 normal = v.invCellBoost.matrix * halfSpace.normal;
    vec4 diff = v.local.pos.coords - pos.coords;
    return dot(diff, normal);
}

RelVector gradient(VerticalHalfSpaceShape halfSpace, RelVector v) {
    Vector local = Vector(v.local.pos, halfSpace.normal);
    return RelVector(local, v.cellBoost, v.invCellBoost);
}
`;