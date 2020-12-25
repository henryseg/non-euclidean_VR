// language=GLSL
export default `//
/***********************************************************************************************************************
 * @struct
 * Nil fake point light
 **********************************************************************************************************************/

struct FakePointLight {
    int id;
    Point position;
    vec3 color;
};

int directions(FakePointLight light, RelVector v, out RelVector dir, out float intensity) {
    Point position = applyIsometry(v.invCellBoost, light.position);
    
    float fakeDistance = fakeDistance(position, v.local.pos);
    intensity = 1. / fakeDistance;
    
    Isometry pull = makeInvTranslation(v.local.pos);
    vec4 aux = position.coords - v.local.pos.coords;
    aux = pull.matrix * aux;
    Vector local = Vector(v.local.pos, aux);
    local = geomNormalize(local);
    dir = RelVector(local, v.cellBoost, v.invCellBoost);
    return 1;
}
`;