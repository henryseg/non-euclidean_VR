uniform sampler2D tDiffuse;
uniform float exposure;
varying vec2 vUv;

vec3 ACESFilm(vec3 x)
{
    float a = 2.51f;
    float b = 0.03f;
    float c = 2.43f;
    float d = 0.59f;
    float e = 0.14f;
    return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0f, 1.0f);
}

void main() {
    vec4 color = texture2D(tDiffuse, vUv);
    vec3 pixelColor = exposure * color.rgb;
    pixelColor = ACESFilm(pixelColor);
    gl_FragColor = vec4(min(vec3(1.0), pixelColor), color.a);
}