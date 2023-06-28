struct SemiLocalSlabShape {
    int id;
    Vector normal;
    float thickness;
    Isometry absoluteIsomInv;

    GroupElement elt0;
    GroupElement elt1;
    GroupElement elt2;
    GroupElement elt3;
    GroupElement elt4;
    GroupElement elt5;
};

float sdf(SemiLocalSlabShape slab, RelVector v) {
    GroupElement shift;
    int hashInvCellBoost = hash(v.invCellBoost);
    switch (hashInvCellBoost) {
        case 0:
            shift = slab.elt0;
            break;
        case 1:
            shift = slab.elt1;
            break;
        case 2:
            shift = slab.elt2;
            break;
        case 3:
            shift = slab.elt3;
            break;
        case 4:
            shift = slab.elt4;
            break;
        case 5:
            shift = slab.elt5;;
            break;
    }
    Vector normal = applyGroupElement(shift, slab.normal);
    float aux = hypDot(v.local.pos.coords, normal.dir);
    return abs(asinh(aux)) - slab.thickness;
}

RelVector gradient(SemiLocalSlabShape slab, RelVector v) {
    GroupElement shift;
    int hashInvCellBoost = hash(v.invCellBoost);
    switch (hashInvCellBoost) {
        case 0:
            shift = slab.elt0;
            break;
        case 1:
            shift = slab.elt1;
            break;
        case 2:
            shift = slab.elt2;
            break;
        case 3:
            shift = slab.elt3;
            break;
        case 4:
            shift = slab.elt4;
            break;
        case 5:
            shift = slab.elt5;;
            break;
    }
    Vector normal = applyGroupElement(shift, slab.normal);
    float aux = hypDot(v.local.pos.coords, normal.dir);
    Vector local = Vector(v.local.pos, sign(aux) * normal.dir);
    return RelVector(local, v.cellBoost, v.invCellBoost);
}

// The uv coordinates are the coordinates of the point in the Klein model of the hyperbolic space.
// To update so that the coordinates correspond to the "core" of the slab.
vec2 uvMap(SemiLocalSlabShape slab, RelVector v) {
    Point point = applyGroupElement(v.cellBoost, v.local.pos);
    point = applyIsometry(slab.absoluteIsomInv, v.local.pos);
    return point.coords.xy / point.coords.w;
}
