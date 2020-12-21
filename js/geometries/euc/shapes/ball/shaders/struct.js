// language=GLSL
export default `
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
float sdf(BallShape ball, RelVector v) {
    Point center = applyIsometry(v.invCellBoost, ball.center);
    return dist(v.local.pos, center) - ball.radius;
}

/**
 * Gradient field for a global euclidean ball
 */
RelVector gradient(BallShape ball, RelVector v){
    Point center = applyIsometry(v.invCellBoost, ball.center);
    Vector local = Vector(v.local.pos, v.local.pos.coords - center.coords);
    local = geomNormalize(local);
    return RelVector(local, v.cellBoost, v.invCellBoost);
}
`;
