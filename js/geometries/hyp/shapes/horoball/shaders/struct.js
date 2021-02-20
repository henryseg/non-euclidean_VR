// language=GLSL
export default `//
/***********************************************************************************************************************
 * @struct
 * Shape of a hyperbolic horoball
 **********************************************************************************************************************/

struct HoroballShape {
    int id;/**< the id of the shape */
    vec4 center;/**< center of the horoball */
    float offset;/**< offset of the origin */
};

/**
 * Distance function for a global hyperbolic horoball
 */
float sdf(HoroballShape horoball, RelVector v) {
    Isometry isom = toIsometry(v.invCellBoost);
    vec4 center = isom.matrix * horoball.center;
    vec4 coords = v.local.pos.coords;
    return log(-hypDot(coords, center)) + horoball.offset;
}

/**
 * Gradient field for a global hyperbolic horoball
 */
RelVector gradient(HoroballShape horoball, RelVector v){
    Isometry isom = toIsometry(v.invCellBoost);
    vec4 center = isom.matrix * horoball.center;
    vec4 coords = v.local.pos.coords;
    vec4 dir = center + hypDot(coords, center) * coords;
    Vector local = Vector(v.local.pos, dir);
    local = geomNormalize(local);
    return RelVector(negate(local), v.cellBoost, v.invCellBoost);
}`;
