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
float sdf(LocalBallShape ball, RelVector v) {
    return dist(v.local.pos, ball.center) - ball.radius;
}

/**
 * Gradient field for a global euclidean ball
 */
RelVector gradient(LocalBallShape ball, RelVector v){
    Vector local = Vector(v.local.pos, v.local.pos.coords - ball.center.coords);
    local = geomNormalize(local);
    return RelVector(local, v.cellBoost, v.invCellBoost);
}
`;
