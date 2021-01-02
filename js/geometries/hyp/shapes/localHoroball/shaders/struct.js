// language=GLSL
export default `//
/***********************************************************************************************************************
 * @struct
 * Shape of a hyperbolic horoball
 **********************************************************************************************************************/

struct LocalHoroballShape {
    int id;/**< the id of the shape */
    vec3 center;/**< center of the horoball */
    float offset;/**< offset of the origin */
};

/**
 * Distance function for a global hyperbolic horoball
 */
float sdf(LocalHoroballShape horoball, ExtVector v) {
    vec4 aux = vec4(horoball.center, 1);
    vec4 coords = v.local.pos.coords;
    return log(-hypDot(coords, aux)) + horoball.offset;
}

/**
 * Gradient field for a global hyperbolic horoball
 */
ExtVector gradient(LocalHoroballShape horoball, ExtVector v){
    vec4 aux = vec4(horoball.center, 1);
    vec4 coords = v.local.pos.coords;
    vec4 dir = aux + hypDot(coords, aux) * coords;
    Vector local = Vector(v.local.pos, dir);
    local = geomNormalize(local);
    return ExtVector(negate(local), v.cellBoost, v.invCellBoost);
}`;
