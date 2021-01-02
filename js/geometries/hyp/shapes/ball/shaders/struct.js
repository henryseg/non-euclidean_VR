// language=GLSL
export default `//
/***********************************************************************************************************************
 * @struct
 * Shape of a hyperbolic ball
 **********************************************************************************************************************/

struct BallShape {
    int id;
    Point center;
    float radius;
};

/**
 * Distance function for a global hyperbolic ball
 */
float sdf(BallShape ball, ExtVector v) {
    Point center = applyIsometry(v.invCellBoost, ball.center);
    return dist(v.local.pos, center) - ball.radius;
}

/**
 * Gradient field for a global hyperbolic ball
 */
ExtVector gradient(BallShape ball, ExtVector v){
    Point center = applyIsometry(v.invCellBoost, ball.center);
    Vector local = direction(v.local.pos, center);
    return ExtVector(negate(local), v.cellBoost, v.invCellBoost);
}

vec2 uvMap(BallShape ball, ExtVector v){
    Point center = applyIsometry(v.invCellBoost, ball.center);
    Vector radius = direction(center, v.local.pos);
    Vector[3] f;
    normalFrame(v.local.pos,f);
    float x = geomDot(radius, f[0]);
    float y = geomDot(radius, f[1]);
    float cosPhi = geomDot(radius, f[2]);
    float sinPhi = sqrt(x * x + y * y);
    float uCoord = atan(y, x);
    float vCoord = atan(sinPhi, cosPhi);
    return vec2(uCoord, vCoord);
}`;
