/***********************************************************************************************************************
 * @struct
 * half space {w < 0}
 **********************************************************************************************************************/

struct LocalStackNoisyWSlabShape {
    int id;
    Point origin;
    float thickness;
    float height;
    Isometry absoluteIsomInv;
};


float sdf(LocalStackNoisyWSlabShape slab, RelVector v) {
    vec4 coords = v.local.pos.coords;
    float w = mod(coords.w, slab.height);
    w = 0.5 * slab.height - abs(0.5 * slab.height - w);
    return w - slab.thickness;

//    float diffW = v.local.pos.coords.w - slab.origin.coords.w;
//    if (sign(diffW * v.local.dir.w) > 0.) {
//        return camera.maxDist;
//    } else {
//        float tanTheta = hypLength(v.local.dir.xyz) / v.local.dir.w;
//        float cosTheta = 1. / sqrt(1. + tanTheta * tanTheta);
//        return min((abs(diffW) - slab.thickness) / cosTheta, camera.maxDist);
//    }
}

RelVector gradient(LocalStackNoisyWSlabShape slab, RelVector v) {
    float diff = v.local.pos.coords.w - slab.origin.coords.w;
    Point global = applyGroupElement(v.cellBoost, v.local.pos);
    float f1 = fracNoise(0.1 * global.coords.xz);
    float f2 = fracNoise(0.1 * global.coords.yz);

    float f3 = fracNoise(0.5 * global.coords.xz);
    float f4 = fracNoise(0.5 * global.coords.yz);

    vec4 dir = vec4(0.3 * normalize(vec2(f1, f2)) + 0.13 * normalize(vec2(f3, f4)), 0, sign(diff));
    dir = toIsometry(v.invCellBoost).matrix * dir;
    Vector local = Vector(v.local.pos, dir);
    local = reduceError(local);
    local = geomNormalize(local);
    return RelVector(local, v.cellBoost, v.invCellBoost);
}

// The uv coordinates are the coordinates of the point in the Klein model of the hyperbolic space.
vec2 uvMap(LocalStackNoisyWSlabShape slab, RelVector v) {
    Point point = v.local.pos;
    vec4 dir = point.coords;
    dir = slab.absoluteIsomInv.matrix * dir;
    return dir.xy / dir.z;
}


