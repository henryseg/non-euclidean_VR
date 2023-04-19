/***********************************************************************************************************************
 * @struct
 * Checkerboard material
 **********************************************************************************************************************/
struct CheckerboardMaterial {
    vec2 dir1;
    vec2 dir2;
    vec3 color1;
    vec3 color2;
};

vec4 render(CheckerboardMaterial material, ExtVector v, vec2 uv) {
    float x1 = mod(dot(uv, material.dir1), 2.);
    float x2 = mod(dot(uv, material.dir2), 2.);
    if (x1 < 1. && x2 < 1.){
        return vec4(material.color1, 1);
    } else if (x1 >= 1. && x2 >= 1.) {
        return vec4(material.color1, 1);
    } else {
        return vec4(material.color2, 1);
    }
}

