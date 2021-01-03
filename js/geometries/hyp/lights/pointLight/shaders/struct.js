// language=GLSL
export default `//
/***********************************************************************************************************************
 * @struct
 * Hyperbolic point light
 **********************************************************************************************************************/

struct PointLight {
    int id;
    Point position;
    vec3 color;
    int maxDirs;
};

bool directions(PointLight light, RelVector v, int i, out RelVector dir, out float intensity) {
    if(i!=0){
        return false;
    }
    Point position = applyIsometry(v.invCellBoost, light.position);
    float dist = dist(v.local.pos, position);
    intensity = lightIntensity(dist);
    Vector local = direction(v.local.pos, position);
    dir = RelVector(local, v.cellBoost, v.invCellBoost);
    return true;
}
`;