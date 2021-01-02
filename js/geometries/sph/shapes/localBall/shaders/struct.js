// language=GLSL
export default `//
/***********************************************************************************************************************
 * @struct
 * Shape of a spherical ball
 **********************************************************************************************************************/

struct LocalBallShape {
    int id;
    Point center;
    float radius;
};

/**
 * Distance function for a global hyperbolic ball
 */
float sdf(LocalBallShape ball, ExtVector v) {
    return dist(v.local.pos, ball.center) - ball.radius;
}

/**
 * Gradient field for a global hyperbolic ball
 */
ExtVector gradient(LocalBallShape ball, ExtVector v){
    Vector local = direction(v.local.pos, ball.center);
    return ExtVector(negate(local), v.cellBoost, v.invCellBoost);
}`;
