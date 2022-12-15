/***********************************************************************************************************************
 * @struct
 * Strips material
 **********************************************************************************************************************/
struct StripsMaterial {
    vec2 dir;
    vec4 lengths;
    vec3 color0;
    vec3 color1;
    vec3 color2;
    vec3 color3;

};

vec3 render(StripsMaterial material, ExtVector v, vec2 uv) {
    float x = mod(dot(uv, material.dir) / dot(material.dir, material.dir), 1.);
    if (x < material.lengths.x){
        return material.color0;
    } else if (x < material.lengths.y){
        return material.color1;
    } else if (x < material.lengths.z){
        return material.color2;
    } else {
        return material.color3;
    }
}

