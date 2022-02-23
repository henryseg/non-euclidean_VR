/***********************************************************************************************************************
 * @struct
 * Shape of a ball in S2xE
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
    Point center = applyGroupElement(v.invCellBoost, ball.center);
    return dist(v.local.pos, center) - ball.radius;
}
