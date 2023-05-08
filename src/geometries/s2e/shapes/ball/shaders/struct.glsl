/***********************************************************************************************************************
 * @struct
 * Shape of a ball in S2xE
 **********************************************************************************************************************/

struct BallShape {
    int id;
    Point center;
    float radius;
};

float sdf(BallShape ball, RelVector v) {
    Point center = applyGroupElement(v.invCellBoost, ball.center);
    return dist(v.local.pos, center) - ball.radius;
}

RelVector gradient(BallShape ball, RelVector v){
    Point center = applyGroupElement(v.invCellBoost, ball.center);
    Vector local = direction(v.local.pos, center);
    return RelVector(negate(local), v.cellBoost, v.invCellBoost);
}
