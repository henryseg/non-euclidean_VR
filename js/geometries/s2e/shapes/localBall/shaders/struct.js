// language=GLSL
export default `//
/***********************************************************************************************************************
 * @struct
 * Shape of a ball in S2xE
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
}`;
