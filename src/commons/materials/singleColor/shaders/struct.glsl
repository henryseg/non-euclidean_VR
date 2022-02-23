/***********************************************************************************************************************
 * Single Color Material
 **********************************************************************************************************************/

struct SingleColorMaterial {
    vec3 color;
};

vec3 render(SingleColorMaterial material, ExtVector v) {
    return material.color;
}