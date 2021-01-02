// language=GLSL
export default `//
/***********************************************************************************************************************
 * @struct
 * Local fake ball
 **********************************************************************************************************************/

struct LocalFakeBallShape {
    int id;
    Point center;
    float radius;
};

/**
 * Distance function for a global euclidean ball
 */
float sdf(LocalFakeBallShape ball, ExtVector v) {
    return fakeDistance(v.local.pos, ball.center) - ball.radius;
}
`;
