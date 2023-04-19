/***********************************************************************************************************************
 * Single Color Material
 **********************************************************************************************************************/

struct SingleColorMaterial {
    vec3 color;
};

vec4 render(SingleColorMaterial material, ExtVector v) {
    return vec4(material.color, 1);
}