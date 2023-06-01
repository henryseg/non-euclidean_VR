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

// not taking into account the isometry for the moment
vec2 uvMap(LocalFakeBallShape ball, RelVector v){
    vec4 center = toVec4(ball.center);
    vec4 p = toVec4(v.local.pos);
    vec4 dir = H2Edirection(center, p);
    float sinPhi = H2EhypLength(dir.xyz);
    float cosPhi = dir.w;
    float uCoord = atan(dir.y, dir.x);
    float vCoord = atan(sinPhi, cosPhi);
    return vec2(uCoord, vCoord);
}