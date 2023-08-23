/***********************************************************************************************************************
 * @struct
 * Probably messy (cf. "- slab.origin.coords" in the SDF
 **********************************************************************************************************************/

struct LocalZSlabShape {
    vec4 test; /**< Extrinsic vector used to compute the distance */
    Point origin; /**< Origin on the boundary of the half space */
    vec3 uDir; /**< Direction of the u-coordinates */
    vec3 vDir; /**< Direction of the v-coordinates */
    float thickness;
};

// one has to be careful with the signs, to make sure that the opposite is indeed the SDF of the complement.
float sdf(LocalZSlabShape slab, RelVector v){
    return abs(dot(v.local.pos.coords, slab.test)) - slab.thickness;
//    return abs(dot(v.local.pos.coords - slab.origin.coords, slab.test)) - slab.thickness;
}

RelVector gradient(LocalZSlabShape slab, RelVector v){
    // keep only the z coordinates of the test vector which is +/- 1 
    vec4 dir = sign(dot(v.local.pos.coords, slab.test)) * slab.test * vec4(0, 0, 1, 0);
//    vec4 dir = sign(dot(v.local.pos.coords- slab.origin.coords, slab.test)) * slab.test * vec4(0, 0, 1, 0);
    Vector local = Vector(v.local.pos, dir);
    return RelVector(local, v.cellBoost, v.invCellBoost);
}

vec2 uvMap(LocalZSlabShape slab, RelVector v){
//    Point pos = applyGroupElement(v.invCellBoost, halfspace.origin);
//    Isometry isom = toIsometry(v.invCellBoost);
//    vec4 uDir = isom.matrix * vec4(halfspace.uDir, 0);
//    vec4 vDir = isom.matrix * vec4(halfspace.vDir, 0);
    float uCoord = dot(v.local.pos.coords - slab.origin.coords, vec4(slab.uDir, 0));
    float vCoord = dot(v.local.pos.coords - slab.origin.coords, vec4(slab.vDir, 0));
    return vec2(uCoord, vCoord);
}

