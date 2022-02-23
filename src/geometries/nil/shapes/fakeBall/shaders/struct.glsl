/***********************************************************************************************************************
 * @struct
 * Fake ball in Nil
 **********************************************************************************************************************/

struct FakeBallShape {
    int id;
    Point center;
    float radius;
};

/**
 * Distance function for a global euclidean ball
 */
float sdf(FakeBallShape ball, RelVector v) {
    Point center = applyIsometry(v.invCellBoost, ball.center);
    return fakeDistance(v.local.pos, center) - ball.radius;
}
