/***********************************************************************************************************************
 * @struct
 * Ball in Nil
 **********************************************************************************************************************/

struct BallShape {
    int id;
    Point center;
    float radius;
};

/**
 * Distance function for a global euclidean ball
 */
float sdf(BallShape ball, RelVector v) {
    Point center = applyIsometry(v.invCellBoost, ball.center);
    float fakeDist = fakeDistance(v.local.pos, center);
    if (fakeDist > 10. * ball.radius) {
        return fakeDist - ball.radius;
    }
    else {
        return exactDistance(v.local.pos, center) - ball.radius;
    }
}

vec2 uvMap(BallShape ball, RelVector v){
    vec4 dir = v.local.pos.coords - ball.center.coords;
    float sinPhi = length(dir.xy);
    float cosPhi = dir.z;
    float uCoord = atan(dir.y, dir.x);
    float vCoord = atan(sinPhi, cosPhi);
    return vec2(uCoord, vCoord);
}
