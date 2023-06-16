/***********************************************************************************************************************
 * @struct
 * Shape of a euclidean ball
 **********************************************************************************************************************/

struct BallShape {
    int id;
    Point center;
    float radius;
    Isometry absoluteIsomInv;
};

/**
 * Distance function for a global euclidean ball
 */
float sdf(BallShape ball, RelVector v) {
    Point center = applyGroupElement(v.invCellBoost, ball.center);
    vec4 w = center.coords - v.local.pos.coords;
    return length(w) - ball.radius;
}

/**
 * Gradient field for a global euclidean ball
 */
RelVector gradient(BallShape ball, RelVector v){
    Point center = applyGroupElement(v.invCellBoost, ball.center);
    Vector local = Vector(v.local.pos, v.local.pos.coords - center.coords);
    local = geomNormalize(local);
    return RelVector(local, v.cellBoost, v.invCellBoost);
}

vec2 uvMap(BallShape ball, RelVector v){
    Point point = applyGroupElement(v.cellBoost, v.local.pos);
    vec4 dir = point.coords - ball.center.coords;
    dir.w = 0.;
    dir = ball.absoluteIsomInv.matrix * dir;
    float sinPhi = length(dir.xy);
    float cosPhi = dir.z;
    float uCoord = atan(dir.y, dir.x);
    float vCoord = atan(sinPhi, cosPhi);
    return vec2(uCoord, vCoord);
}