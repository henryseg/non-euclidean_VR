/***********************************************************************************************************************
 * Varying Color Material
 **********************************************************************************************************************/

struct VaryingColorMaterial {
    vec3 mainColor;
    vec3 weight;
};

vec4 render(VaryingColorMaterial material, ExtVector v) {
    vec3 color = material.mainColor + material.weight * v.vector.local.pos.coords.xyw;
    return vec4(color, 1);
}