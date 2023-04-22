

/***********************************************************************************************************************
 * @struct
 * Checkerboard material
 **********************************************************************************************************************/
struct VideoAlphaTextureMaterial {
    sampler2D sampler;
    vec2 start;
    vec2 scale;
    bool repeatU;
    bool repeatV;
};

vec4 render(VideoAlphaTextureMaterial material, ExtVector v, vec2 uv) {
    vec2 texCoords = (uv - material.start) * material.scale;
    vec2 texCoordsUV = vec2(texCoords.x, 0.5 + 0.5 * texCoords.y);
    vec2 texCoordsAlpha = vec2(texCoords.x, 0.5 * texCoords.y);
    vec4 color =  texture(material.sampler, texCoordsUV);
    float alpha = texture(material.sampler, texCoordsAlpha).x;
    return vec4(color.rgb, alpha);
}