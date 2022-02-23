/***********************************************************************************************************************
 * @struct
 * Shape of a hyperbolic ball
 **********************************************************************************************************************/

struct LocalBallShape {
    int id;
    Point center;
    float radius;
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
    Vector radius = direction(ball.center, v.local.pos);
    Vector[3] f;
    orthoFrame(v.local.pos,f);
    float x = geomDot(radius, f[0]);
    float y = geomDot(radius, f[1]);
    float cosPhi = geomDot(radius, f[2]);
    float sinPhi = sqrt(x * x + y * y);
    float uCoord = atan(y, x);
    float vCoord = atan(sinPhi, cosPhi);
    return vec2(uCoord, vCoord);
}
