// language=GLSL
export default `//
/***********************************************************************************************************************
 * @struct
 * Shape of a spherical ball
 **********************************************************************************************************************/

struct BallShape {
    int id;
    Point center;
    float radius;
    Isometry absoluteIsomInv;
};

/**
 * Distance function for a global hyperbolic ball
 */
float sdf(BallShape ball, RelVector v) {
    Point center = applyGroupElement(v.invCellBoost, ball.center);
    return dist(v.local.pos, center) - ball.radius;
}

/**
 * Gradient field for a global hyperbolic ball
 */
RelVector gradient(BallShape ball, RelVector v){
    Point center = applyGroupElement(v.invCellBoost, ball.center);
    Vector local = direction(v.local.pos, center);
    return RelVector(negate(local), v.cellBoost, v.invCellBoost);
}

vec2 uvMap(BallShape ball, RelVector v){
    Point center = applyGroupElement(v.invCellBoost, ball.center);
    Vector direction = direction(center, v.local.pos);
    vec4 dir = ball.absoluteIsomInv.matrix * direction.dir;
    dir = normalize(dir);
    float sinPhi = length(dir.xy);
    float cosPhi = dir.z;
    float uCoord = -atan(dir.y, dir.x);
    float vCoord = atan(sinPhi, cosPhi);
    return vec2(uCoord, vCoord);
}

`;
