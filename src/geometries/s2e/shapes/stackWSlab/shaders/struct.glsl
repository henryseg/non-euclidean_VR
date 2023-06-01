/***********************************************************************************************************************
 * @struct
 * half space {w < 0}
 **********************************************************************************************************************/

struct StackWSlabShape {
    int id;
    Point origin;
    float thickness;
    float height;
    Isometry absoluteIsomInv;
};

float sdf(StackWSlabShape slab, RelVector v) {
    vec4 coords = v.local.pos.coords;
    float w = mod(coords.w, slab.height);
    w = 0.5 * slab.height - abs(0.5 * slab.height - w);
    return w - slab.thickness;
//    return abs(v.local.pos.coords.w - slab.origin.coords.w) - slab.thickness;
}

RelVector gradient(StackWSlabShape slab, RelVector v){
    float diff = v.local.pos.coords.w - slab.origin.coords.w;
    Vector local = Vector(v.local.pos, vec4(0, 0, 0, sign(diff)));
    return RelVector(local, v.cellBoost, v.invCellBoost);
}

// PROBABLY NEED TO REDO THIS: TAKE THE UV COORDINATES OF HALF SPACE!
vec2 uvMap(StackWSlabShape slab, RelVector v){
    Point point = v.local.pos;
    vec4 dir = point.coords;
    dir = slab.absoluteIsomInv.matrix * dir;
    return dir.xy / dir.z;
}


