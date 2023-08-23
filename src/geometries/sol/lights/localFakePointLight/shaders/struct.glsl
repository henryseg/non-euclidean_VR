/***********************************************************************************************************************
 * @struct
 * Euclidean point light
 **********************************************************************************************************************/

struct LocalFakePointLight {
    int id;
    vec3 color;
    float intensity;
    Point position;
    int maxDirs;
};

bool directions(LocalFakePointLight light, RelVector v, int i, out RelVector dir, out float intensity) {
    if (i!=0){
        return false;
    }
    float fakeDistance = length(light.position.coords - v.local.pos.coords);
    intensity = (1. / fakeDistance) * light.intensity;

    Isometry pull = makeInvTranslation(v.local.pos);
    vec4 aux = light.position.coords - v.local.pos.coords;
    aux = pull.matrix * aux;
    Vector local = Vector(v.local.pos, aux);
    local = geomNormalize(local);
    dir = RelVector(local, v.cellBoost, v.invCellBoost);
    return true;
}