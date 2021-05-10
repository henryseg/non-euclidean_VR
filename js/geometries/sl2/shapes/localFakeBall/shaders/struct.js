// language=GLSL
export default `//
/***********************************************************************************************************************
 * @struct
 * Fake ball in Nil
 **********************************************************************************************************************/

struct LocalFakeBallShape {
    int id;
    Point center;
    float radius;
};

/**
 * Distance function for a global euclidean ball
 */
float sdf(LocalFakeBallShape ball, RelVector v) {
    return fakeDistance(v.local.pos, ball.center) - ball.radius;
}
`;
