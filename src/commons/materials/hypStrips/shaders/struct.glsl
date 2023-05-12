/***********************************************************************************************************************
 * Strips on a hyperbolic plane (represented as the Klein model).
 **********************************************************************************************************************/

struct HypStripsMaterial {
    float totalWidth;
    vec4 lengths;
    vec3 color0;
    vec3 color1;
    vec3 color2;
    vec3 color3;
};

vec4 render(HypStripsMaterial material, ExtVector v, vec2 uv) {
    vec3 color;
    float aux = clamp(uv.x, -1., 1.);
    float dist = atanh(aux);
    float x = mod(dist / material.totalWidth, 1.);
    if (x < material.lengths.x){
        color = material.color0;
    } else if (x < material.lengths.y){
        color = material.color1;
    } else if (x < material.lengths.z){
        color = material.color2;
    } else {
        color = material.color3;
    }

    return vec4(color, 1);
}