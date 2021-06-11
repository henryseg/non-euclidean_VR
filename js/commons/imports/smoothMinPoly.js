// language=GLSL
export default `//

float smoothMinPoly(float a, float b, float k){
    float h = max(1. - abs(a - b) / k, 0.);
    return min(a, b) - h * h * k * (1. / 4.);
}

`