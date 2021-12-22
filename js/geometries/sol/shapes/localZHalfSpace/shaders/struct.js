// language=GLSL
export default `//
/***********************************************************************************************************************
 * @struct
 * Euclidean half space
 **********************************************************************************************************************/

struct LocalZHalfSpaceShape {
    vec4 test; /**< Extrinsic vector used to compute the distance */
    Point origin; /**< Origin on the boundary of the half space */
    vec3 uDir; /**< Direction of the u-coordinates */
    vec3 vDir; /**< Direction of the v-coordinates */
};

// one has to be careful with the signs, to make sure that the opposite is indeed the SDF of the complement.
float sdf(LocalZHalfSpaceShape halfspace, RelVector v){
    return dot(v.local.pos.coords, halfspace.test);
}

RelVector gradient(LocalZHalfSpaceShape halfspace, RelVector v){
    // keep only the z coordinates of the test vector which is +/- 1 
    vec4 dir = halfspace.test * vec4(0, 0, 1, 0);
    Vector local = Vector(v.local.pos, dir);
    return RelVector(local, v.cellBoost, v.invCellBoost);
}

vec2 uvMap(LocalZHalfSpaceShape halfspace, RelVector v){
//    Point pos = applyGroupElement(v.invCellBoost, halfspace.origin);
//    Isometry isom = toIsometry(v.invCellBoost);
//    vec4 uDir = isom.matrix * vec4(halfspace.uDir, 0);
//    vec4 vDir = isom.matrix * vec4(halfspace.vDir, 0);
    float uCoord = dot(v.local.pos.coords - halfspace.origin.coords, vec4(halfspace.uDir, 0));
    float vCoord = dot(v.local.pos.coords - halfspace.origin.coords, vec4(halfspace.vDir, 0));
    return vec2(uCoord, vCoord);
}`;

