/***********************************************************************************************************************
 * @struct
 * Nil fake point light
 **********************************************************************************************************************/

struct FakePointLight {
    int id;
    Point position;
    vec3 color;
    float intensity;
    int maxDirs;
};

bool directions(FakePointLight light, RelVector v, int i, out RelVector dir, out float intensity) {
    if (i!=0){
        return false;
    }
    Point position = applyIsometry(v.invCellBoost, light.position);

    float fakeDistance = fakeDistance(position, v.local.pos);
    intensity = (1. / fakeDistance) * light.intensity;

    Isometry pull = makeInvTranslation(v.local.pos);
    vec4 aux = position.coords - v.local.pos.coords;
    aux = pull.matrix * aux;
    Vector local = Vector(v.local.pos, aux);
    local = geomNormalize(local);
    dir = RelVector(local, v.cellBoost, v.invCellBoost);
    return true;
}