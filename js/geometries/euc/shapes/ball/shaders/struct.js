// language=GLSL
export default `//
/***********************************************************************************************************************
 * @struct
 * Shape of a euclidean ball
 **********************************************************************************************************************/

struct BallShape {
    int id;
    Point center;
    float radius;
};

/**
 * Distance function for a global euclidean ball
 */
float sdf(BallShape ball, ExtVector v) {
    Point center = applyIsometry(v.invCellBoost, ball.center);
    return dist(v.local.pos, center) - ball.radius;
}

/**
 * Gradient field for a global euclidean ball
 */
ExtVector gradient(BallShape ball, ExtVector v){
    Point center = applyIsometry(v.invCellBoost, ball.center);
    Vector local = Vector(v.local.pos, v.local.pos.coords - center.coords);
    local = geomNormalize(local);
    return ExtVector(local, v.cellBoost, v.invCellBoost);
}

vec2 uvMap(BallShape ball, ExtVector v){
    Point center = applyIsometry(v.invCellBoost, ball.center);
    vec4 dir = normalize(v.local.pos.coords - center.coords);
    float sinPhi = sqrt(dir.x * dir.x + dir.y * dir.y);
    float cosPhi = dir.z;
    float uCoord = atan(dir.y, dir.x);
    float vCoord = atan(sinPhi, cosPhi);
    return vec2(uCoord,vCoord);
}
`;
