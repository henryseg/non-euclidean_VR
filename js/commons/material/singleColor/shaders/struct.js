// language=GLSL
export default `//
/***********************************************************************************************************************
 * Single Color Material
 **********************************************************************************************************************/

struct SingleColorMaterial {
    vec3 color;
};

vec3 render(SingleColorMaterial material) {
    return material.color;
}`;