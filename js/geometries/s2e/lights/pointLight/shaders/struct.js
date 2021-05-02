// language=GLSL
export default `//
/***********************************************************************************************************************
 * @struct
 * S2xE point light
 **********************************************************************************************************************/
struct PointLight {
    int id;
    vec3 color;
    Point position;
    int maxDirs;
};

bool directions(PointLight light, RelVector v, int i, out RelVector dir, out float intensity) {
    if (i!=0){
        return false;
    }
    Point position = applyGroupElement(v.invCellBoost, light.position);
    float dist = dist(v.local.pos, position);
    intensity = lightIntensity(dist);
    Vector local = direction(v.local.pos, position);
    dir = RelVector(local, v.cellBoost, v.invCellBoost);
    return true;
}
`;