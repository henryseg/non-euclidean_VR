// language=GLSL
export default `//
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

vec3 render(CheckerboardMaterial material, RelVector v, vec2 uv) {
    float x1 = mod(dot(uv, material.dir1), 2.);
    float x2 = mod(dot(uv, material.dir2), 2.);
    if (x1 < 1. && x2 < 1.){
        return material.color1;
    } else if (x1 >= 1. && x2 >= 1.) {
        return material.color1;
    } else {
        return material.color2;
    }
}
`;

