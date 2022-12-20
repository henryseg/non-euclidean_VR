uniform sampler2D tDiffuse;
uniform float exposure;
varying vec2 vUv;


vec3 LessThan(vec3 f, float value)
{
    return vec3(
    (f.x < value) ? 1.0f : 0.0f,
    (f.y < value) ? 1.0f : 0.0f,
    (f.z < value) ? 1.0f : 0.0f);
}

//GAMMA CORRECTION
vec3 LinearToSRGB(vec3 rgb)
{
    rgb = clamp(rgb, 0.0f, 1.0f);

    return mix(
    pow(rgb, vec3(1.0f / 2.4f)) * 1.055f - 0.055f,
    rgb * 12.92f,
    LessThan(rgb, 0.0031308f)
    );
}
//TONE MAPPING
vec3 ACESFilm(vec3 x)
{
    float a = 2.51f;
    float b = 0.03f;
    float c = 2.43f;
    float d = 0.59f;
    float e = 0.14f;
    return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0f, 1.0f);
}

vec3 postProcess(vec3 pixelColor){

    //set the exposure
    pixelColor *= exposure;

    //correct tones
    pixelColor = ACESFilm(pixelColor);
    pixelColor = LinearToSRGB(pixelColor);

    return pixelColor;
}

void main() {
    vec4 color = texture2D(tDiffuse, vUv);
    vec3 aux = postProcess(color.rgb);
    gl_FragColor = vec4(min(vec3(1.0), aux), color.a);
}