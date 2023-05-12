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
    center = reduceError(center);
    return abs(dist(v.local.pos, center)) - ball.radius;
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
    Point pos = applyGroupElement(v.cellBoost, v.local.pos);
    Vector direction = direction(ball.center, pos);
    direction = applyIsometry(ball.absoluteIsomInv, direction);
    vec4 dir = normalize(direction.dir);
    float sinPhi = length(dir.xy);
    float cosPhi = dir.z;
    float uCoord = -atan(dir.y, dir.x);
    float vCoord = atan(sinPhi, cosPhi);
    return vec2(uCoord, vCoord);
}
