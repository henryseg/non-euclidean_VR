// language=GLSL
export default `//
/***********************************************************************************************************************
 * @struct
 * Very fake ball (using euclidean SDF after a pull back at the origin)
 **********************************************************************************************************************/

struct VeryFakeBallShape {
    int id;
    Point center;
    float radius;
};

/**
 * Distance function for a global euclidean ball
 */
float sdf(VeryFakeBallShape ball, RelVector v) {
    Vector aux = applyIsometry(v.cellBoost, v.local);
    Isometry inv = makeInvTranslation(ball.center);
    aux = applyIsometry(inv, aux);
//    debugColor = aux.pos.coords.xyz;
//    debugColor = vec3(0,ball.radius,0);
    
    return length(aux.pos.coords.xyz) - ball.radius;
}
`;
