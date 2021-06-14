// language=GLSL
export default `//
/***********************************************************************************************************************
 * @struct
 * Euclidean half space
 **********************************************************************************************************************/

struct HalfSpaceShape {
    Vector normal; /**< Normal to the half space */
    vec3 uDir; /**< Direction of the u-coordinates */
    vec3 vDir; /**< Direction of the v-coordinates */
};

// one has to be careful with the signs, to make sure that the opposite is indeed the SDF of the complement.
float sdf(HalfSpaceShape halfspace, RelVector v){
    Vector normal = applyGroupElement(v.invCellBoost, halfspace.normal);
    float dotp = dot(v.local.pos.coords - normal.pos.coords, normal.dir);
    if (abs(dotp) < camera.threshold){
        return dotp;
    }
    float dotv = dot(v.local.dir, normal.dir);
    if (dotv * dotp >= 0.){
        return sign(dotp) * camera.maxDist;
    }
    return - abs(dotp) / dotv;
}

RelVector gradient(HalfSpaceShape halfspace, RelVector v){
    Vector normal = applyGroupElement(v.invCellBoost, halfspace.normal);
    Vector local = Vector(v.local.pos, normal.dir);
    return RelVector(local, v.cellBoost, v.invCellBoost);
}

vec2 uvMap(HalfSpaceShape halfspace, RelVector v){
    Point pos = applyGroupElement(v.invCellBoost, halfspace.normal.pos);
    Isometry isom = toIsometry(v.invCellBoost);
    vec4 uDir = isom.matrix * vec4(halfspace.uDir, 0);
    vec4 vDir = isom.matrix * vec4(halfspace.vDir, 0);
    float uCoord = dot(v.local.pos.coords - pos.coords, uDir);
    float vCoord = dot(v.local.pos.coords - pos.coords, vDir);
    return vec2(uCoord, vCoord);
}`;

