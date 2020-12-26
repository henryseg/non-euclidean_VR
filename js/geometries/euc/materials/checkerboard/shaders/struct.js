// language=GLSL
export default `//
/***********************************************************************************************************************
 * @struct
 * Checkerboard material
 **********************************************************************************************************************/
struct CheckerboardMaterial {
    vec4 dir1;
    vec4 dir2;
    vec3 color1;
    vec3 color2;
};

vec3 render(CheckerboardMaterial material, RelVector v) {
    Point pos = applyIsometry(v.cellBoost, v.local.pos);
    float x1 = mod(dot(pos.coords, material.dir1), 2.);
    float x2 = mod(dot(pos.coords, material.dir2), 2.);
    if (x1 < 1. && x2 < 1.){
        return material.color1;
    } else if (x1 >= 1. && x2 >= 1.) {
        return material.color1;
    } else {
        return material.color2;
    }
}
`;

