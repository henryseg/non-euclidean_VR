/***********************************************************************************************************************
 * @struct
 * Nil fake point light
 **********************************************************************************************************************/

struct FakeLocalPointLight {
    int id;
    Point position;
    vec3 color;
    float intensity;
    int maxDirs;
};

bool directions(FakeLocalPointLight light, RelVector v, int i, out RelVector dir, out float intensity) {
    if (i!=0){
        return false;
    }
//    Point position = applyIsometry(v.invCellBoost, light.position);

    float fakeDistance = fakeDistance(light.position, v.local.pos);
    intensity = (1. / fakeDistance) * light.intensity;

    Isometry pull = makeInvTranslation(v.local.pos);
    vec4 aux = light.position.coords - v.local.pos.coords;
    aux = pull.matrix * aux;
    Vector local = Vector(v.local.pos, aux);
    local = geomNormalize(local);
    dir = RelVector(local, v.cellBoost, v.invCellBoost);
    return true;
}