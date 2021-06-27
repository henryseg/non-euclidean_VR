/***********************************************************************************************************************
 * @struct
 * Shape of a ball in H2xE
 **********************************************************************************************************************/

struct BallShape {
    int id;
    Point center;
    float radius;
};

/**
 * Distance function for a global ball
 */
float sdf(BallShape ball, RelVector v) {
    Point center = applyGroupElement(v.invCellBoost, ball.center);
    return dist(v.local.pos, center) - ball.radius;
}

/**
 * Gradient field for a global ball
 */
RelVector gradient(BallShape ball, RelVector v){
    Point center = applyGroupElement(v.invCellBoost, ball.center);
    Vector local = direction(v.local.pos, center);
    return RelVector(negate(local), v.cellBoost, v.invCellBoost);
}
