/***********************************************************************************************************************
 * @struct
 * half space {w < 0}
 **********************************************************************************************************************/

struct LocalWHalfSpaceShape {
    int id;
    Point origin;
    Isometry absoluteIsomInv;
};

float sdf(LocalWHalfSpaceShape halfspace, RelVector v) {
    float w = halfspace.origin.coords.w;
    return halfspace.absoluteIsomInv.matrix[3][3] * (v.local.pos.coords.w - w);
}

RelVector gradient(LocalWHalfSpaceShape halfspace, RelVector v){
    float coeff = halfspace.absoluteIsomInv.matrix[3][3];
    Vector local = Vector(v.local.pos, vec4(0, 0, 0, sign(coeff)));
    return RelVector(local, v.cellBoost, v.invCellBoost);
}

// The uv coordinates are the coordinates of the point in the Klein model of the hyperbolic space.
vec2 uvMap(LocalWHalfSpaceShape halfspace, RelVector v){
    Point point = v.local.pos;
    vec4 dir = point.coords;
    dir = halfspace.absoluteIsomInv.matrix * dir;
    return dir.xy / dir.z;
}


