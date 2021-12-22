// language=GLSL
export default `//

float smoothMinPoly(float a, float b, float k){
    float h = max(1. - abs(a - b) / k, 0.);
    return min(a, b) - 0.25 * k * h * h;
}

`