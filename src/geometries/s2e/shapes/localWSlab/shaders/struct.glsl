/***********************************************************************************************************************
 * @struct
 * half space {w < 0}
 **********************************************************************************************************************/

struct LocalWSlabShape {
    int id;
    Point origin;
    float thickness;
    Isometry absoluteIsomInv;
};

float sdf(LocalWSlabShape slab, RelVector v) {
    return abs(v.local.pos.coords.w - slab.origin.coords.w) - slab.thickness;
}

RelVector gradient(LocalWSlabShape slab, RelVector v){
    float diff = v.local.pos.coords.w - slab.origin.coords.w;
    Vector local = Vector(v.local.pos, vec4(0, 0, 0, sign(diff)));
    return RelVector(local, v.cellBoost, v.invCellBoost);
}

// PROBABLY NEED TO REDO THIS: TAKE THE UV COORDINATES OF HALF SPACE!
vec2 uvMap(LocalWSlabShape slab, RelVector v){
    Point point = v.local.pos;
    vec4 dir = point.coords;
    dir = slab.absoluteIsomInv.matrix * dir;
    return dir.xy / dir.z;
}


