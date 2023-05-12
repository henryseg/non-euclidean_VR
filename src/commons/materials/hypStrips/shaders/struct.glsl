/***********************************************************************************************************************
 * Strips on a hyperbolic plane (represented as the Klein model).
 **********************************************************************************************************************/

struct HypStripsMaterial {
    vec3 color1;
    vec3 color2;
    float width1;
    float width2;
};

vec4 render(HypStripsMaterial material, ExtVector v, vec2 uv) {
    float aux = clamp(uv.x, -1., 1.);
    float dist = atanh(aux);
    dist = mod(dist, material.width1 + material.width2);
    if (dist < material.width1) {
        return vec4(material.color1, 1);
    } else {
        return vec4(material.color2, 1);
    }
}