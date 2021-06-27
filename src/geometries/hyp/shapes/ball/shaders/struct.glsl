/***********************************************************************************************************************
 * @struct
 * Shape of a hyperbolic ball
 **********************************************************************************************************************/

struct BallShape {
    int id;
    Point center;
    float radius;
};

/**
 * Distance function for a global hyperbolic ball
 */
float sdf(BallShape ball, RelVector v) {
    Point center = applyIsometry(v.invCellBoost, ball.center);
    return dist(v.local.pos, center) - ball.radius;
}

/**
 * Gradient field for a global hyperbolic ball
 */
RelVector gradient(BallShape ball, RelVector v){
    Point center = applyIsometry(v.invCellBoost, ball.center);
    Vector local = direction(v.local.pos, center);
    return RelVector(negate(local), v.cellBoost, v.invCellBoost);
}

/**
 * UV Map
 * Note that the section of the (orthonormal) frame bundle that we use here is not invariant under isometries.
 * Hence we have to go back and forth between the local and the global position.
 * Find a better way to do this? 
 */
vec2 uvMap(BallShape ball, RelVector v){
    Vector[3] f;
    Point pos = applyGroupElement(v.cellBoost, v.local.pos);
    orthoFrame(pos, f);

    f[0] = applyGroupElement(v.invCellBoost, f[0]);
    f[1] = applyGroupElement(v.invCellBoost, f[1]);
    f[2] = applyGroupElement(v.invCellBoost, f[2]);
    Point center = applyIsometry(v.invCellBoost, ball.center);
    
    Vector radius = direction(center, v.local.pos);

    float x = geomDot(radius, f[0]);
    float y = geomDot(radius, f[1]);
    float cosPhi = geomDot(radius, f[2]);
    float sinPhi = sqrt(x * x + y * y);
    float uCoord = atan(y, x);
    float vCoord = atan(sinPhi, cosPhi);
    return vec2(uCoord, vCoord);
}
