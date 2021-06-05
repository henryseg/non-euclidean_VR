// language=GLSL
export default `//
/***********************************************************************************************************************
 * @struct
 * Checkerboard material
 **********************************************************************************************************************/
struct BasicPTMaterial {
    vec3 emission;
    vec3 diffuse;
    vec3 specular;
    vec3 absorb;
    float ior;
    float diffuseChance;
    float reflectionChance;
    float refractionChance;
};


RayType setRayType(BasicPTMaterial material, ExtVector v, RelVector n) {
    RayType res = RayType(false, false, false, 0.);
    float random = randomFloat();
    
    if (random < material.diffuseChance){
        res.diffuse = true;
        res.chance = material.diffuseChance;
    } else if (random < material.diffuseChance + material.reflectionChance){
        res.reflect = true;
        res.chance = material.reflectionChance;
    }
    else {
        res.refract = true;
        res.chance = material.refractionChance;
    }
    return res;
}

vec3 render(BasicPTMaterial material, ExtVector v, RayType rayType) {
    if(rayType.reflect){
        return material.specular;
    }
    return material.diffuse;
}
`;

