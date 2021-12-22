// language=GLSL
export default `//

/***********************************************************************************************************************
 * @struct
 * Vertical half space
 **********************************************************************************************************************/

struct VerticalHalfSpaceShape {
    Point pos;
    vec3 normal;
    vec3 uDir;
    vec3 vDir;
};

float sdf(VerticalHalfSpaceShape halfSpace, RelVector v) {
    // pull back the data, so that the vector is at the origin
    // and keep only the projection onto E^2
    Point pos = halfSpace.pos;
    Isometry invCellBoost = toIsometry(v.invCellBoost);
    pos = applyGroupElement(v.invCellBoost, pos);
    Isometry shift = makeInvTranslation(v.local.pos);
    pos = applyIsometry(shift, pos);
    vec2 p = pos.coords.xy;
    // the normal vector need not be translated by shift
    // indeed shift induces an translation of E^2, that does not affect the tangent vector.
    vec4 normal = invCellBoost.matrix * vec4(halfSpace.normal, 0);
    vec2 n = normalize(normal.xy);


    float dotp = dot(p, n);
    if (abs(dotp) < 2. * camera.threshold){
        // the currrent point is already close to the boundary of the half space
        return - dotp;
    }
    
    float c = v.local.dir.z;
    vec2 u = v.local.dir.xy;
    float a = length(u);

    // flip the figure to make sure that c > 0
    // this does not change the distances
    mat2 flip = mat2(0, 1, 1, 0);
    if (c < 0.){
        c = -c;
        u = flip * u;
        n = flip * n;
        p = flip * p;
    }
    
    // flip the half space inside out, so that the origin belongs to the half space
    float sign = 1.;
    if (dotp < 0.) {
        dotp = - dotp;
        n = -n;
        sign = -1.;
    }
    if (abs(c) <= 0.){
        // horizontal geodesic
//        return - sign * dotp;
        float dotv = dot(u, n);
        if (dotv <= 0.){
            // the geodesic never enter/exit the half space
            return - sign * camera.maxDist;
        }
        return - sign * dotp / dotv;
    }

    float aCosPhi = n.y * u.x - n.x * u.y;
    if (aCosPhi + a  < c * dotp) {
        // the geodesic stays in the half space
//        return - sign * dotp;
        return - sign * camera.maxDist;
    }

    // general case
    float aSinPhi = dot(u, n);
    float phi = atan(aSinPhi, aCosPhi);
    float psi = acos(max((aCosPhi - c * dotp) / a, -1.));
//    return - sign * dotp;
    return - sign * (psi - phi) / c;


}

RelVector gradient(VerticalHalfSpaceShape halfSpace, RelVector v) {
    Vector local = Vector(v.local.pos, vec4(halfSpace.normal, 0));
    return RelVector(local, v.cellBoost, v.invCellBoost);
}

vec2 uvMap(VerticalHalfSpaceShape halfSpace, RelVector v) {
    Isometry invCellBoost = toIsometry(v.invCellBoost);
    Point pos = applyGroupElement(v.invCellBoost, halfSpace.pos);
    vec4 uDir = invCellBoost.matrix * vec4(halfSpace.uDir, 0);
    vec4 vDir = invCellBoost.matrix * vec4(halfSpace.vDir, 0);
    float uCoord = dot(v.local.pos.coords - pos.coords, uDir);
    float vCoord = dot(v.local.pos.coords - pos.coords, vDir);
    return vec2(uCoord, vCoord);
}`;