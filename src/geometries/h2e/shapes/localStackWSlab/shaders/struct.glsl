/***********************************************************************************************************************
 * @struct
 * half space {w < 0}
 **********************************************************************************************************************/

struct LocalStackWSlabShape {
    int id;
    Point origin;
    float thickness;
    float height;
    Isometry absoluteIsomInv;
};


float sdf(LocalStackWSlabShape slab, RelVector v) {
    float w = v.local.pos.coords.w - slab.origin.coords.w;
    w = w - round(w / slab.height) * slab.height;
    return abs(w) - slab.thickness;

}

RelVector gradient(LocalStackWSlabShape slab, RelVector v) {
    float w = v.local.pos.coords.w - slab.origin.coords.w;
    w = w - round(w / slab.height) * slab.height;

    Vector local = Vector(v.local.pos, vec4(0, 0, 0, sign(w)));
    return RelVector(local, v.cellBoost, v.invCellBoost);
}

// The uv coordinates are the coordinates of the point in the Klein model of the hyperbolic space.
vec2 uvMap(LocalStackWSlabShape slab, RelVector v) {
    Point point = v.local.pos;
    vec4 dir = point.coords;
    dir = slab.absoluteIsomInv.matrix * dir;
    return dir.xy / dir.z;
}


