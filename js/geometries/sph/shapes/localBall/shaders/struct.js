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
float sdf(LocalBallShape ball, RelVector v) {
    return dist(v.local.pos, ball.center) - ball.radius;
}

/**
 * Gradient field for a global hyperbolic ball
 */
RelVector gradient(LocalBallShape ball, RelVector v){
    Vector local = direction(v.local.pos, ball.center);
    return RelVector(negate(local), v.cellBoost, v.invCellBoost);
}`;
