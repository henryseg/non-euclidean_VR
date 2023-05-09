/***********************************************************************************************************************
 * @struct
 * half space {w < 0}
 **********************************************************************************************************************/

struct WHalfSpaceShape {
    int id;
    Point origin;
    Isometry absoluteIsomInv;
};

float sdf(WHalfSpaceShape halfspace, RelVector v) {
    Isometry invCellBoost = toIsometry(v.invCellBoost);
    float w = invCellBoost.matrix[3][3] * halfspace.origin.coords.w + invCellBoost.shift;
    return halfspace.absoluteIsomInv.matrix[3][3] * (v.local.pos.coords.w - w);
}

RelVector gradient(WHalfSpaceShape halfspace, RelVector v){
    Isometry invCellBoost = toIsometry(v.invCellBoost);
    float coeff = invCellBoost.matrix[3][3] * halfspace.absoluteIsomInv.matrix[3][3];
    Vector local = Vector(v.local.pos, vec4(0, 0, 0, sign(coeff)));
    return RelVector(local, v.cellBoost, v.invCellBoost);
}

// The uv coordinates are the coordinates of the point in the Klein model of the hyperbolic space.
vec2 uvMap(WHalfSpaceShape halfspace, RelVector v){
    Point point = applyGroupElement(v.cellBoost, v.local.pos);
    vec4 dir = point.coords;
    dir = halfspace.absoluteIsomInv.matrix * dir;
    return dir.xy / dir.z;
}


