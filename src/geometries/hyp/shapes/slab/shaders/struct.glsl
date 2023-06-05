struct SlabShape {
    int id;
    Vector normal;
    float thickness;
    Isometry absoluteIsomInv;
};

float sdf(SlabShape slab, RelVector v) {
    Vector normal = applyGroupElement(v.invCellBoost, slab.normal);
    float aux = hypDot(v.local.pos.coords, normal.dir);
    return abs(asinh(aux)) - slab.thickness;
}

RelVector gradient(SlabShape slab, RelVector v){
    Vector normal = applyGroupElement(v.invCellBoost, slab.normal);
    float aux = hypDot(v.local.pos.coords, normal.dir);
    Vector local = Vector(v.local.pos, sign(aux) * normal.dir);
    return RelVector(local, v.cellBoost, v.invCellBoost);
}

// The uv coordinates are the coordinates of the point in the Klein model of the hyperbolic space.
// To update so that the coordinates correspond to the "core" of the slab.
vec2 uvMap(SlabShape slab, RelVector v){
    Point point = applyGroupElement(v.cellBoost, v.local.pos);
    point = applyIsometry(slab.absoluteIsomInv, v.local.pos);
    return point.coords.xy / point.coords.w;
}
