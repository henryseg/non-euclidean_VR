// language=GLSL
export default `//
/***********************************************************************************************************************
 * @struct
 * Shape of a euclidean box
 **********************************************************************************************************************/

struct BoxShape {
    int id;
    Point center;
    vec3 sides;
    float rounded;
};

/**
 * Distance function for a global euclidean ball
 */
float sdf(BoxShape box, RelVector v) {
    Point center = applyGroupElement(v.invCellBoost, box.center);
    vec4 w = center.coords - v.local.pos.coords;
    //w is our relative position from the center
    vec3 q = abs(w.xyz) - box.sides;
    //from iq
    return length(max(q, 0.)) + min(max(q.x, max(q.y, q.z)), 0.) - box.rounded;
}

/**
 * Gradient field for a global euclidean box
 */
//RelVector gradient(BallShape ball, RelVector v){
//    Point center = applyGroupElement(v.invCellBoost, ball.center);
//    Vector local = Vector(v.local.pos, v.local.pos.coords - center.coords);
//    local = geomNormalize(local);
//    return RelVector(local, v.cellBoost, v.invCellBoost);
//}
`;
