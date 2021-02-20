// language=GLSL
export default `//
/***********************************************************************************************************************
 * @struct
 * Fake ball in Nil
 **********************************************************************************************************************/

struct NewFakeBallShape {
    int id;
    Point center;
    float radius;
};

/**
 * Distance function for a global euclidean ball
 */
float sdf(NewFakeBallShape ball, RelVector v) {
    Point center = applyIsometry(v.invCellBoost, ball.center);
    return fakeDistance(v.local.pos, center) - ball.radius;
}
`;
