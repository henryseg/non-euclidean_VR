/***********************************************************************************************************************
 * @struct
 * Shape of a ball in S2xE
 **********************************************************************************************************************/

struct LocalStackBallShape {
    int id;
    Point center;
    float radius;
    float height;
    Isometry absoluteIsomInv;
};


/**
 * Distance function for a global hyperbolic ball
 */
float sdf(LocalStackBallShape ball, RelVector v) {
    float w = v.local.pos.coords.w - ball.center.coords.w;
    w = w - round(w / ball.height) * ball.height;
    v.local.pos.coords.w = ball.center.coords.w + w;
    return dist(v.local.pos, ball.center) - ball.radius;
}

/**
 * Gradient field for a local ball
 */
RelVector gradient(LocalStackBallShape ball, RelVector v) {
    float w = v.local.pos.coords.w - ball.center.coords.w;
    w = w - round(w / ball.height) * ball.height;
    v.local.pos.coords.w = ball.center.coords.w + w;
    Vector local = direction(v.local.pos, ball.center);
    return RelVector(negate(local), v.cellBoost, v.invCellBoost);
}


vec2 uvMap(LocalStackBallShape ball, RelVector v) {
    float w = v.local.pos.coords.w - ball.center.coords.w;
    w = w - round(w / ball.height) * ball.height;
    v.local.pos.coords.w = ball.center.coords.w + w;

    Vector vec = direction(ball.center, v.local.pos);
    vec4 dir = ball.absoluteIsomInv.matrix * vec.dir;
    //    vec4 dir = vec.dir;
    float sinPhi = length(dir.xyz);
    float cosPhi = dir.w;
    float uCoord = atan(dir.y, dir.x);
    float vCoord = atan(sinPhi, cosPhi);
    return vec2(uCoord, vCoord);
}

