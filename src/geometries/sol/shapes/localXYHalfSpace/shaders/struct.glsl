/***********************************************************************************************************************
 * @struct
 * Euclidean half space
 **********************************************************************************************************************/

struct LocalXHalfSpaceShape {
    vec4 testX; /**< Extrinsic auxiliairy vector used to compute the distance */
    vec4 testZ; /**< Extrinsic auxiliairy vector used to compute the distance */
    Point origin;
    vec3 uDir; /**< Direction of the u-coordinates */
    vec3 vDir; /**< Direction of the v-coordinates */
};

// one has to be careful with the signs, to make sure that the opposite is indeed the SDF of the complement.
float sdf(LocalXHalfSpaceShape halfspace, RelVector v){
    float dotX = dot(v.local.pos.coords, halfspace.testX);
    float dotZ = dot(v.local.pos.coords, halfspace.testZ);
    return asinh(dotX * exp(-dotZ));
}

RelVector gradient(LocalXHalfSpaceShape halfspace, RelVector v){
    float dotX = dot(v.local.pos.coords, halfspace.testX);
    float dotZ = dot(v.local.pos.coords, halfspace.testZ);
    float eDotZ = exp(-dotZ);
    float coeff = 1. / sqrt(dotX * dotX * eDotZ * eDotZ + 1.);
    vec4 dir = coeff * eDotZ * (halfspace.testX - dotX * halfspace.testZ);
    // projecting to the tangent space of Sol 
    // todo : check this
    dir.w = 0.;
    Isometry isom = makeInvTranslation(v.local.pos);
    dir = isom.matrix * dir;
    Vector n = Vector(v.local.pos, dir);
    n = geomNormalize(n);
    return RelVector(n, v.cellBoost, v.invCellBoost);
}

vec2 uvMap(LocalXHalfSpaceShape halfspace, RelVector v){
//    Point pos = applyGroupElement(v.invCellBoost, halfspace.origin);
//    Isometry isom = toIsometry(v.invCellBoost);
//    vec4 uDir = isom.matrix * vec4(halfspace.uDir, 0);
//    vec4 vDir = isom.matrix * vec4(halfspace.vDir, 0);
    float uCoord = dot(v.local.pos.coords - halfspace.origin.coords, vec4(halfspace.uDir, 0));
    float vCoord = dot(v.local.pos.coords - halfspace.origin.coords, vec4(halfspace.vDir, 0));
    return vec2(uCoord, vCoord);
}

