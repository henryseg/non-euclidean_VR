/***********************************************************************************************************************
 * @struct
 * Checkerboard material
 **********************************************************************************************************************/
struct SquaresMaterial {
    vec2 dir1;
    vec2 dir2;
    vec4 lengths;
    vec3 color0;
    vec3 color1;
    vec3 color2;
    vec3 color3;

};

vec3 render(SquaresMaterial material, ExtVector v, vec2 uv) {
    float x1 = mod(dot(uv, material.dir1) / dot(material.dir1, material.dir1), 2.);
    float x2 = mod(dot(uv, material.dir2) / dot(material.dir2, material.dir2), 2.);
    float c1 = abs(x1 - 1.);
    float c2 = abs(x2 - 1.);
    if (c1 < material.lengths.x && c2 < material.lengths.x){
        return material.color0;
    } else if (c1 < material.lengths.y && c2 < material.lengths.y){
        return material.color1;
    } else if (c1 < material.lengths.z && c2 < material.lengths.z){
        return material.color2;
    } else {
        return material.color3;
    }
}

