// language=GLSL
export default `//
/***********************************************************************************************************************
 * @struct
 * Shape of a hyperbolic horoball
 **********************************************************************************************************************/

struct LocalDirectedHoroballShape {
    int id;/**< the id of the shape */
    vec3 center;/**< center of the horoball */
    float offset;/**< offset of the origin */
};

/**
 * Distance function for a global hyperbolic horoball
 */
float sdf(LocalDirectedHoroballShape horoball, RelVector v) {
    vec4 center = vec4(horoball.center, 1);
    vec4 coords = v.local.pos.coords;
    float dotP = hypDot(coords, center);
    float dist = log(-dotP) + horoball.offset;
    if (dist >= 0.){
        return dist;
    }
    float dotV = hypDot(v.local.dir, center);
    float theta = atanh(dotV / dotP);
    float a = sqrt(dotP * dotP - dotV * dotV);
    return theta - acosh(exp(-horoball.offset) / a);
}

/**
 * Gradient field for a global hyperbolic horoball
 */
RelVector gradient(LocalDirectedHoroballShape horoball, RelVector v){
    vec4 center = vec4(horoball.center, 1);
    vec4 coords = v.local.pos.coords;
    vec4 dir = center + hypDot(coords, center) * coords;
    Vector local = Vector(v.local.pos, dir);
    local = geomNormalize(local);
    return RelVector(negate(local), v.cellBoost, v.invCellBoost);
}`;
