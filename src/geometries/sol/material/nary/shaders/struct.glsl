/***********************************************************************************************************************
 * @struct
 * n-ary tilling of hyperbolic planes
 **********************************************************************************************************************/
struct NaryMaterial {
    float t;
    int n;
    vec4 lengths;
    vec3 color0;
    vec3 color1;
    vec3 color2;
    vec3 color3;

};

vec3 render(NaryMaterial material, ExtVector v, vec2 uv) {
    float logn = log(float(material.n));
    float k = round(uv.y / logn);
    float c1 = 2. * abs(uv.y - k * logn);
    float aux = round(uv.x / (k * material.t));
    float c2 = 2. * abs(uv.x - aux * k * material.t);
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

