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
float sdf(LocalBallShape ball, RelVector v) {
    vec4 w =  ball.center.coords  - v.local.pos.coords;
    return length(w) - ball.radius;
}

/**
 * Gradient field for a global euclidean ball
 */
RelVector gradient(LocalBallShape ball, RelVector v){
    Vector local = Vector(v.local.pos, v.local.pos.coords - ball.center.coords);
    local = geomNormalize(local);
    return RelVector(local, v.cellBoost, v.invCellBoost);
}

vec2 uvMap(LocalBallShape ball, RelVector v){
    vec4 dir = v.local.pos.coords - ball.center.coords;
    float sinPhi = sqrt(dir.x * dir.x + dir.y * dir.y);
    float cosPhi = dir.z;
    float uCoord = atan(dir.y, dir.x);
    float vCoord = atan(sinPhi, cosPhi);
    return vec2(uCoord, vCoord);
}

