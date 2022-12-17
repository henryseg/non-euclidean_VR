/***********************************************************************************************************************
 * @struct
 * Hyperbolic light at infinity
 **********************************************************************************************************************/

struct SunLight {
    int id;
    vec4 position;
    vec3 color;
    float intensity;
    int maxDirs;
};

bool directions(SunLight light, RelVector v, int i, out RelVector dir, out float intensity) {
    if (i!=0){
        return false;
    }
    intensity = light.intensity;
    vec4 p = v.local.pos.coords;
    vec4 l = toIsometry(v.invCellBoost).matrix * light.position;
    vec4 u = hypDot(p, p) / hypDot(l, p) * l - p;
    Vector local = Vector(v.local.pos, u);
    local = geomNormalize(local);
    dir = RelVector(local, v.cellBoost, v.invCellBoost);
    return true;
}