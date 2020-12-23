// language=GLSL
export default `//
/***********************************************************************************************************************
 * @struct
 * Spherical point light
 **********************************************************************************************************************/

struct PointLight {
    int id;
    Point position;
    vec3 color;
};

int directions(PointLight light, RelVector v, out RelVector dir, out float intensity) {
    Point position = applyIsometry(v.invCellBoost, light.position);
    float dist = dist(v.local.pos, position);
    intensity = lightIntensity(dist);
    Vector local = direction(v.local.pos, position);
    dir = RelVector(local, v.cellBoost, v.invCellBoost);
    return 1;
}
`;