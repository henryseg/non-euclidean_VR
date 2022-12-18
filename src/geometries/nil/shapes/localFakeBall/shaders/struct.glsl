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
float sdf(LocalFakeBallShape ball, RelVector v) {
    return fakeDistance(v.local.pos, ball.center) - ball.radius;
}

vec2 uvMap(LocalFakeBallShape ball, RelVector v){
    vec4 dir = v.local.pos.coords - ball.center.coords;
    float sinPhi = length(dir.xy);
    float cosPhi = dir.z;
    float uCoord = atan(dir.y, dir.x);
    float vCoord = atan(sinPhi, cosPhi);
    return vec2(uCoord, vCoord);
}


