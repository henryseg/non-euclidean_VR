/***********************************************************************************************************************
 * @struct
 * Fake ball in Nil
 **********************************************************************************************************************/

struct LocalFakeBallShape {
    int id;
    Point center;
    float radius;
    Isometry absoluteIsomInv;
};

/**
 * Distance function for a global euclidean ball
 */
float sdf(LocalFakeBallShape ball, RelVector v) {
    vec4 diff = v.local.pos.coords - ball.center.coords;
    return length(diff) - ball.radius;
}

/**
 * Gradient field for a global euclidean ball
 */
RelVector gradient(LocalFakeBallShape ball, RelVector v){
    Vector local = Vector(v.local.pos, v.local.pos.coords - ball.center.coords);
    local = geomNormalize(local);
    return RelVector(local, v.cellBoost, v.invCellBoost);
}

vec2 uvMap(LocalFakeBallShape ball, RelVector v){
    vec4 dir = v.local.pos.coords - ball.center.coords;
    dir.w = 0.;
    dir = ball.absoluteIsomInv.matrix * dir;
    float sinPhi = length(dir.xy);
    float cosPhi = dir.z;
    float uCoord = atan(dir.y, dir.x);
    float vCoord = atan(sinPhi, cosPhi);
    return vec2(uCoord, vCoord);
}

