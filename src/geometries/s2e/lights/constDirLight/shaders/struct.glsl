/***********************************************************************************************************************
 * @struct
 * Euclidean point light
 **********************************************************************************************************************/
struct ConstDirLight {
    int id;
    vec3 color;
    float intensity;
    vec4 direction;
    int maxDirs;
};

bool directions(ConstDirLight light, RelVector v, int i, out RelVector dir, out float intensity) {
    if (i != 0){
        return false;
    }
    intensity = light.intensity;
    Vector local = Vector(v.local.pos, light.direction);
    dir = RelVector(local, v.cellBoost, v.invCellBoost);
    return true;
}
