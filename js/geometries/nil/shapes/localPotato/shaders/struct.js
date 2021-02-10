// language=GLSL
export default `//
/***********************************************************************************************************************
 * @struct
 * Local potato shape
 **********************************************************************************************************************/

struct LocalPotatoShape {
    int id;
    Point center;
    float radius;
    float coeff1;
    float coeff2;
    float exp;
};

/**
 * Distance function for a global euclidean ball
 */
float sdf(LocalPotatoShape potato, RelVector v) {
    Isometry pull = makeInvTranslation(potato.center);
    Point p = applyIsometry(pull, v.local.pos);
    float x = p.coords.x;
    float y = p.coords.y;
    float rhosq = x * x + y * y;
    float hsq = fakeHeightSq(p);
    float aux = potato.coeff1 * pow(rhosq, 0.5 * potato.exp) + potato.coeff2 * pow(hsq, 0.5 * potato.exp);
    return pow(aux, 1. / potato.exp) - potato.radius;
}
`;
