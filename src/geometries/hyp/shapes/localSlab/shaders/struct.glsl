struct LocalSlabShape {
    int id;
    Vector normal;
    float thickness;
    Isometry absoluteIsomInv;
};

float sdf(LocalSlabShape slab, RelVector v) {
    float aux = hypDot(v.local.pos.coords, slab.normal.dir);
    return abs(asinh(aux)) - slab.thickness;
}

RelVector gradient(LocalSlabShape slab, RelVector v){
    float aux = hypDot(v.local.pos.coords, slab.normal.dir);
    Vector local = Vector(v.local.pos, sign(aux) * slab.normal.dir);
    return RelVector(local, v.cellBoost, v.invCellBoost);
}

// The uv coordinates are the coordinates of the point in the Klein model of the hyperbolic space.
// To update so that the coordinates correspond to the "core" of the slab.
vec2 uvMap(LocalSlabShape slab, RelVector v){
    Point point = applyIsometry(slab.absoluteIsomInv, v.local.pos);
    return point.coords.xy / point.coords.w;
}
