/***********************************************************************************************************************
 * Varying Color Material
 **********************************************************************************************************************/

struct VaryingColorMaterial {
    vec3 mainColor;
    vec3 weight;
};

vec3 render(VaryingColorMaterial material, ExtVector v) {
    return material.mainColor + material.weight * v.vector.local.pos.coords.xyz;
}