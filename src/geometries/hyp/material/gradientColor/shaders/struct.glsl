/***********************************************************************************************************************
 * Gradient Color Material
 **********************************************************************************************************************/

struct GradientColorMaterial {
    vec3 color1;
    vec3 color2;
    float start1;
    float start2;
};

vec3 render(GradientColorMaterial material, ExtVector v) {
    float aux = clamp(v.vector.local.pos.coords.z, material.start1, material.start2);
    float coeff = (aux - material.start1) / (material.start2 - material.start1);
    return (1. - coeff) * material.color1 + coeff * material.color2;
}