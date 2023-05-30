/***********************************************************************************************************************
 * @struct
 * Shape of a euclidean local ball
 **********************************************************************************************************************/

struct LocalDirectedBallShape {
    int id;
    Point center;
    float radius;
    Isometry absoluteIsomInv;
};

/**
 * Distance function for a global euclidean ball
 */
float sdf(LocalDirectedBallShape ball, RelVector v) {
    vec4 w =  ball.center.coords  - v.local.pos.coords;
    float d = length(w);
    float diff = d - ball.radius;
    // the current point is inside the sphere.
    if (diff <= 0.){
        return diff;
    }
    float dotProduct = dot(v.local.dir, w);
    // the vector is pointing in the opposite direction
    if (dotProduct < 0.){
        return camera.maxDist;
    }
    // the current point is outside the sphere
    float d2 = d * d;
    float cos0Sq = (d2 - ball.radius * ball.radius) / d2;
    float cos1Sq = dotProduct * dotProduct / d2;
    if (cos1Sq < cos0Sq){
        return camera.maxDist;
    }

    return diff;

}

/**
 * Gradient field for a global euclidean ball
 */
RelVector gradient(LocalDirectedBallShape ball, RelVector v){
    Vector local = Vector(v.local.pos, v.local.pos.coords - ball.center.coords);
    local = geomNormalize(local);
    return RelVector(local, v.cellBoost, v.invCellBoost);
}

vec2 uvMap(LocalDirectedBallShape ball, RelVector v){
    vec4 dir = v.local.pos.coords - ball.center.coords;
    dir.w = 0.;
    dir = ball.absoluteIsomInv.matrix * dir;
    float sinPhi = length(dir.xy);
    float cosPhi = dir.z;
    float uCoord = atan(dir.y, dir.x);
    float vCoord = atan(sinPhi, cosPhi);
    return vec2(uCoord, vCoord);
}

