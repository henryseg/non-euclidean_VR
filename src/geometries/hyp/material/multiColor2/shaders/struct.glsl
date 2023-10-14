/***********************************************************************************************************************
 * Multi-Color Material
 **********************************************************************************************************************/

struct MultiColor2Material {
    vec3 mainColor;
    vec3 accent1;
    vec3 accent2;
    vec3 accent3;
};

vec4 render(MultiColor2Material material, ExtVector v) {

    float x = v.vector.local.pos.coords.x;
    float y = v.vector.local.pos.coords.y;
    float z = v.vector.local.pos.coords.z;

    vec3 color = material.mainColor;
    color += material.accent1 * abs(x);
    color += material.accent2 * abs(y);
    color += material.accent3 * abs(z);

    return vec4(color, 1);
}