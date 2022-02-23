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

