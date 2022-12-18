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

vec2 uvMap(FakeBallShape ball, RelVector v){
    vec4 dir = v.local.pos.coords - ball.center.coords;
    float sinPhi = length(dir.xy);
    float cosPhi = dir.z;
    float uCoord = atan(dir.y, dir.x);
    float vCoord = atan(sinPhi, cosPhi);
    return vec2(uCoord, vCoord);
}
