/***********************************************************************************************************************
 * Varying Color Material
 **********************************************************************************************************************/

struct VaryingColorMaterial {
    vec3 mainColor;
    vec3 weight;
};

vec4 render(VaryingColorMaterial material, ExtVector v) {
    vec3 color =  material.mainColor + material.weight * normalize(v.vector.local.pos.proj.yzw);
    return vec4(color, 1);
}