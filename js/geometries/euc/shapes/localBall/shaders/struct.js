// language=GLSL
export default `//
/***********************************************************************************************************************
 * @struct
 * Shape of a euclidean local ball
 **********************************************************************************************************************/

struct LocalBallShape {
    int id;
    Point center;
    float radius;
};

/**
 * Distance function for a global euclidean ball
 */
float sdf(LocalBallShape ball, ExtVector v) {
    return dist(v.local.pos, ball.center) - ball.radius;
}

/**
 * Gradient field for a global euclidean ball
 */
ExtVector gradient(LocalBallShape ball, ExtVector v){
    Vector local = Vector(v.local.pos, v.local.pos.coords - ball.center.coords);
    local = geomNormalize(local);
    return ExtVector(local, v.cellBoost, v.invCellBoost);
}

vec2 uvMap(LocalBallShape ball, ExtVector v){
    vec4 dir = normalize(v.local.pos.coords - ball.center.coords);
    float sinPhi = sqrt(dir.x * dir.x + dir.y * dir.y);
    float cosPhi = dir.z;
    float uCoord = atan(dir.y, dir.x);
    float vCoord = atan(sinPhi, cosPhi);
    return vec2(uCoord,vCoord);
}
`;
