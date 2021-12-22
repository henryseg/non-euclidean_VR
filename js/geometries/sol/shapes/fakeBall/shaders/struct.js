// language=GLSL
export default `//
/***********************************************************************************************************************
 * @struct
 * Fake ball in Nil
 **********************************************************************************************************************/

struct FakeBallShape {
    int id;
    Point center;
    float radius;
};

/**
 * Distance function for a global euclidean ball
 */
float sdf(FakeBallShape ball, RelVector v) {
    Point center = applyGroupElement(v.invCellBoost, ball.center);
    vec4 diff = v.local.pos.coords - center.coords;
    return length(diff) - ball.radius;
}

/**
 * Gradient field for a global euclidean ball
 */
RelVector gradient(FakeBallShape ball, RelVector v){
    Point center = applyGroupElement(v.invCellBoost, ball.center);
    Vector local = Vector(v.local.pos, v.local.pos.coords - center.coords);
    local = geomNormalize(local);
    return RelVector(local, v.cellBoost, v.invCellBoost);
}

`;

