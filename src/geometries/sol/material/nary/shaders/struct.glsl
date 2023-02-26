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
    float nfloat = float(material.n);
    float logn = log(nfloat);

    float scaledY = uv.y / logn;
    float k = round(scaledY);
    float c1 = 2. * abs(scaledY - k);

    float scaledX = uv.x / (pow(nfloat, -k) * material.t);
    float aux = floor(scaledX);
    float c2 = abs(2. * (scaledX - aux) - 1.);

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

