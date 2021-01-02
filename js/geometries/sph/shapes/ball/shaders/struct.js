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
}`;
