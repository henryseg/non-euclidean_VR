/***********************************************************************************************************************
 * @struct
 * Euclidean point light
 **********************************************************************************************************************/

struct ConstDirLight {
    int id;
    vec3 color;
    float intensity;
    vec3 direction;
    int maxDirs;
};

bool directions(ConstDirLight light, RelVector v, int i, out RelVector dir, out float intensity) {
    if (i!=0){
        return false;
    }
    intensity = light.intensity;
    //    Isometry invCellBoost = toIsometry(v.invCellBoost);
    //    vec4 coords = invCellBoost.matrix * vec4(light.direction, 0.);
    vec4 coords = vec4(light.direction, 0.);
    Vector local = Vector(v.local.pos, coords);
    dir = RelVector(local, v.cellBoost, v.invCellBoost);
    return true;
}