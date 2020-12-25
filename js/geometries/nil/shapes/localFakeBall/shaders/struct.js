// language=GLSL
export default `//
/***********************************************************************************************************************
 * @struct
 * Very fake ball (using euclidean SDF after a pull back at the origin)
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
