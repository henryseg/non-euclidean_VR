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
float sdf(BallShape ball, RelVector v) {
    Point center = applyIsometry(v.invCellBoost, ball.center);
    return dist(v.local.pos, center) - ball.radius;
}

/**
 * Gradient field for a global hyperbolic ball
 */
RelVector gradient(BallShape ball, RelVector v){
    Point center = applyIsometry(v.invCellBoost, ball.center);
    Vector local = direction(v.local.pos, center);
    return RelVector(negate(local), v.cellBoost, v.invCellBoost);
}`;
