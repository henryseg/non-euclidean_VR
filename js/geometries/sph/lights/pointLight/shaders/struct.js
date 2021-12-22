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
    float intensity;
    int maxDirs;
};

/***********************************************************************************************************************
 * @struct
 * Structure to store auxiliary light computations
 * For the moment, it is really a cheap trick.
 * One could improve this later (e.g. having one PointLightComputations object for each instance of PointLight).
 **********************************************************************************************************************/

struct PointLightComputations{
    RelVector dir;
    float dist;
};

PointLightComputations pointLightComputations;

bool directions(PointLight light, RelVector v, int i, out RelVector dir, out float intensity) {
    if (i>1){
        return false;
    }
    if (i==0){
        Point position = applyIsometry(v.invCellBoost, light.position);
        float dist = dist(v.local.pos, position);
        intensity = lightIntensity(dist) * light.intensity;
        Vector local = direction(v.local.pos, position);
        dir = RelVector(local, v.cellBoost, v.invCellBoost);
        pointLightComputations = PointLightComputations(dir, dist);
    }
    if (i==1){
        intensity = lightIntensity(2. * PI - pointLightComputations.dist);
        dir = negate(pointLightComputations.dir);
    }
    return true;
}
`;