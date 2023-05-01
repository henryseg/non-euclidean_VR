/***********************************************************************************************************************
 * @struct
 * Checkerboard material
 **********************************************************************************************************************/
struct VideoFrameTextureMaterial {
    sampler2D sampler;
    vec2 start;
    vec2 scale;
    bool repeatU;
    bool repeatV;
};

vec4 render(VideoFrameTextureMaterial material, ExtVector v, vec2 uv) {
    vec2 texCoords = (uv - material.start) * material.scale;
    return texture(material.sampler, texCoords);
}


