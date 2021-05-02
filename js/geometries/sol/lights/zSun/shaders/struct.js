// language=GLSL
export default `//
/***********************************************************************************************************************
 * @struct
 * Euclidean point light
 **********************************************************************************************************************/

struct ZSun {
    int id;
    vec3 color;
    float direction;
    int maxDirs;
};

bool directions(ZSun light, RelVector v, int i, out RelVector dir, out float intensity) {
    if (i!=0){
        return false;
    }
    intensity = 0.8;
    Vector local=Vector(v.local.pos, vec4(0, 0, light.direction, 0));
    dir = RelVector(local, v.cellBoost, v.invCellBoost);
    return true;
}
`;