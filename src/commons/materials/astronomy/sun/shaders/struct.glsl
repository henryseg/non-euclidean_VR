/***********************************************************************************************************************
 * @struct
 * Checkerboard material
 **********************************************************************************************************************/
struct SunTextureMaterial {
    sampler2D sampler;
    vec2 start;
    vec2 scale;
    bool repeatU;
    bool repeatV;
};

vec3 render(SunTextureMaterial material, ExtVector v, vec2 uv) {
    vec2 texCoords = (uv - material.start) * material.scale;
    vec4 color = texture(material.sampler, texCoords);
    return color.xyz;
}


