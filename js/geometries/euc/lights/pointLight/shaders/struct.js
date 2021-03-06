// language=GLSL
export default `//
/***********************************************************************************************************************
 * @struct
 * Euclidean point light
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
    vec4 aux = position.coords - v.local.pos.coords;
    intensity = lightIntensity(length(aux));
    aux = normalize(aux);
    Vector local = Vector(v.local.pos, aux);
    dir = RelVector(local, v.cellBoost, v.invCellBoost);
    return true;
}
`;