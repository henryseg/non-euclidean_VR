/***********************************************************************************************************************
 * @struct
 * Local point light
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
//    Point position = applyGroupElement(v.invCellBoost, light.position);
    float dist = fakeDistance(v.local.pos, light.position);
    intensity = lightIntensity(dist) * light.intensity;
    Vector local = fakeDirection(v.local.pos, light.position);
    dir = RelVector(local, v.cellBoost, v.invCellBoost);
    return true;
}
