/***********************************************************************************************************************
 * @struct
 * Local ball
 **********************************************************************************************************************/

struct LocalBallShape {
    int id;
    Point center;
    float radius;
};

/**
 * Distance function for a global euclidean ball
 */
float sdf(LocalBallShape ball, RelVector v) {
    float fakeDist = fakeDistance(v.local.pos, ball.center);
    if (fakeDist > 10. * ball.radius) {
        return fakeDist - ball.radius;
    }
    else {
        return exactDistance(v.local.pos, ball.center) - ball.radius;
    }
}

vec2 uvMap(LocalBallShape ball, RelVector v){
    vec4 dir = v.local.pos.coords - ball.center.coords;
    float sinPhi = length(dir.xy);
    float cosPhi = dir.z;
    float uCoord = atan(dir.y, dir.x);
    float vCoord = atan(sinPhi, cosPhi);
    return vec2(uCoord, vCoord);
}


