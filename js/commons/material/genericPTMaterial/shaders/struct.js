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
    float reflectionChance;
    float refractionChance;
    float diffuseChance;
};

vec3 render(BasicPTMaterial material, ExtVector v, RelVector n) {
   return material.diffuse;
}
`;

