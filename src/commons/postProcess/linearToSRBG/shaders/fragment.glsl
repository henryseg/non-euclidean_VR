uniform sampler2D tDiffuse;
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

void main() {
    vec4 color = texture2D(tDiffuse, vUv);
    vec3 pixelColor = color.rgb;
    pixelColor = LinearToSRGB(pixelColor);
    gl_FragColor = vec4(min(vec3(1.0), pixelColor), color.a);
}