// language=GLSL
export default `//
/***********************************************************************************************************************
 * @struct
 * Shape of a euclidean ball
 **********************************************************************************************************************/

struct BallShape {
    int id;
    Point center;
    float radius;
};

/**
 * Distance function for a global euclidean ball
 */
float sdf(BallShape ball, RelVector v) {
    Point center = applyGroupElement(v.invCellBoost, ball.center);
    vec4 w = center.coords - v.local.pos.coords;
    return length(w) - ball.radius;
}

/**
 * Gradient field for a global euclidean ball
 */
RelVector gradient(BallShape ball, RelVector v){
    Point center = applyGroupElement(v.invCellBoost, ball.center);
    Vector local = Vector(v.local.pos, v.local.pos.coords - center.coords);
    local = geomNormalize(local);
    return RelVector(local, v.cellBoost, v.invCellBoost);
}

vec2 uvMap(BallShape ball, RelVector v){
    Point center = applyGroupElement(v.invCellBoost, ball.center);
    vec4 dir = normalize(v.local.pos.coords - center.coords);
    float sinPhi = length(dir.xy);
    float cosPhi = dir.z;
    float uCoord = -atan(dir.y, dir.x);
    float vCoord = atan(sinPhi, cosPhi);
    return vec2(uCoord, vCoord);
}
`;
