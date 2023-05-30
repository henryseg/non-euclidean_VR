/***********************************************************************************************************************
 * Multi-Color Material
 **********************************************************************************************************************/

struct MultiColorMaterial {
    vec3 mainColor;
    vec3 accent1;
    vec3 accent2;
    vec3 accent3;
};

vec4 render(MultiColorMaterial material, ExtVector v) {
    vec3 color = material.mainColor;
    color += material.accent1 * v.vector.local.pos.coords.x;
    color += material.accent2 * v.vector.local.pos.coords.y;
    color += material.accent3 * v.vector.local.pos.coords.z;
    return vec4(color, 1);
}