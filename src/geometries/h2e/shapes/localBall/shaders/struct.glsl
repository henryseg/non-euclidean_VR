/***********************************************************************************************************************
 * @struct
 * Shape of a ball in H2xE
 **********************************************************************************************************************/

struct LocalBallShape {
    int id;
    Point center;
    float radius;
    Isometry absoluteIsomInv;
};

/**
 * Distance function for a local ball
 */
float sdf(LocalBallShape ball, RelVector v) {
    return dist(v.local.pos, ball.center) - ball.radius;
}

/**
 * Gradient field for a local ball
 */
RelVector gradient(LocalBallShape ball, RelVector v){
    Vector local = direction(v.local.pos, ball.center);
    return RelVector(negate(local), v.cellBoost, v.invCellBoost);
}

vec2 uvMap(LocalBallShape ball, RelVector v){
    Vector vec =  direction(ball.center, v.local.pos);
    vec4 dir = ball.absoluteIsomInv.matrix * vec.dir;
//    vec4 dir = vec.dir;
    float sinPhi = hypLength(dir.xyz);
    float cosPhi = dir.w;
    float uCoord = atan(dir.y, dir.x);
    float vCoord = atan(sinPhi, cosPhi);
    return vec2(uCoord, vCoord);
}
