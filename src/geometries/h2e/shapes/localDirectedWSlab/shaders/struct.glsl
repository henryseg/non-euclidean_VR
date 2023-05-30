/***********************************************************************************************************************
 * @struct
 * half space {w < 0}
 **********************************************************************************************************************/

struct LocalDirectedWSlabShape {
    int id;
    Point origin;
    float thickness;
    Isometry absoluteIsomInv;
};

float sdf(LocalDirectedWSlabShape slab, RelVector v) {
    float diffW = v.local.pos.coords.w - slab.origin.coords.w;
    if(sign(diffW * v.local.dir.w) > 0.) {
        return camera.maxDist;
    } else {
        float tanTheta = hypLength(v.local.dir.xyz) / v.local.dir.w;
        float cosTheta = 1. / sqrt(1. + tanTheta * tanTheta);
        return min((abs(diffW) - slab.thickness) / cosTheta, camera.maxDist);
    }

}

RelVector gradient(LocalDirectedWSlabShape slab, RelVector v){
    float diff = v.local.pos.coords.w - slab.origin.coords.w;
    Vector local = Vector(v.local.pos, vec4(0, 0, 0, sign(diff)));
    return RelVector(local, v.cellBoost, v.invCellBoost);
}

// The uv coordinates are the coordinates of the point in the Klein model of the hyperbolic space.
vec2 uvMap(LocalDirectedWSlabShape slab, RelVector v){
    Point point = v.local.pos;
    vec4 dir = point.coords;
    dir = slab.absoluteIsomInv.matrix * dir;
    return dir.xy / dir.z;
}


