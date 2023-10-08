/***********************************************************************************************************************
 * @struct
 * Hyperbolic point light
 **********************************************************************************************************************/

struct TruePointLight {
    int id;
    Point position;
    vec3 color;
    float intensity;
    int maxDirs;
};

bool directions(TruePointLight light, RelVector v, int i, out RelVector dir, out float intensity) {
    if (i!=0){
        return false;
    }
    Point position = applyGroupElement(v.invCellBoost, light.position);
    float dist = dist(v.local.pos, position);
    intensity = trueLightIntensity(dist) * light.intensity;
    Vector local = direction(v.local.pos, position);
    dir = RelVector(local, v.cellBoost, v.invCellBoost);
    return true;
}