/***********************************************************************************************************************
 * @struct
 * Shape of a spherical ball
 **********************************************************************************************************************/

struct LocalBallShape {
    int id;
    Point center;
    float radius;
    Isometry absoluteIsomInv;
};

/**
 * Distance function for a global hyperbolic ball
 */
float sdf(LocalBallShape ball, RelVector v) {
    return dist(v.local.pos, ball.center) - ball.radius;
}

/**
 * Gradient field for a global hyperbolic ball
 */
RelVector gradient(LocalBallShape ball, RelVector v){
    Vector local = direction(v.local.pos, ball.center);
    return RelVector(negate(local), v.cellBoost, v.invCellBoost);
}

vec2 uvMap(LocalBallShape ball, RelVector v){
    Point pos = v.local.pos;
    Vector direction = direction(ball.center, pos);
    direction = applyIsometry(ball.absoluteIsomInv, direction);
    vec4 dir = normalize(direction.dir);
    float sinPhi = length(dir.xy);
    float cosPhi = dir.z;
    float uCoord = atan(dir.y, dir.x);
    float vCoord = atan(sinPhi, cosPhi);
    return vec2(uCoord, vCoord);
}

