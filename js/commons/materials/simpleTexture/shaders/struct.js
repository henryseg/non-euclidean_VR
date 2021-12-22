// language=GLSL
export default `//
/***********************************************************************************************************************
 * @struct
 * Checkerboard material
 **********************************************************************************************************************/
struct SimpleTextureMaterial {
    sampler2D sampler;
    vec2 start;
    vec2 scale;
    bool repeatU;
    bool repeatV;
};

vec3 render(SimpleTextureMaterial material, ExtVector v, vec2 uv) {
    vec2 texCoords = (uv - material.start) * material.scale;
    vec4 color = texture(material.sampler, texCoords);
    //    vec4 color = vec4(texCoords.r,0, 0, 0);
    return color.xyz;
}
`;

