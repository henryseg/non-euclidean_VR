/***********************************************************************************************************************
 * @struct
 * n-ary tilling of hyperbolic planes
 **********************************************************************************************************************/
struct NaryMaterialEquidistant {
    float t;
    int n;
    vec4 heights;
    vec3 widths;
    vec3 color0;
    vec3 color1;
    vec3 color2;
    vec3 color3;

};

vec4 render(NaryMaterialEquidistant material, ExtVector v, vec2 uv) {
    vec3 color;
    float nfloat = float(material.n);
    float logn = log(nfloat);

    float scaledY = uv.y / logn;
    float k = round(scaledY);
    float y = 2. * (scaledY - k);
    float testY = abs(y);

    float scaledX = uv.x / (pow(nfloat, -k) * material.t);
    float aux = floor(scaledX);
    float x = 2. * (scaledX - aux) - 1.;
    float testX = -y - 2. * log(1. - abs(x)) / logn;

    if (testY < material.heights.x && testX < material.widths.x){
        color = material.color0;
    } else if (testY < material.heights.y && testX < material.widths.y){
        color = material.color1;
    } else if (testY < material.heights.z && testX < material.widths.z){
        color = material.color2;
    } else {
        color = material.color3;
    }

    return vec4(color, 1);
}

