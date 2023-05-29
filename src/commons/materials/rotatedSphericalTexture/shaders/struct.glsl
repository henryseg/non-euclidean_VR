/***********************************************************************************************************************
 * @struct
 * Checkerboard material
 **********************************************************************************************************************/

struct RotatedSphericalTextureMaterial {
    sampler2D sampler;
    mat4 rotation;
    vec2 start;
    vec2 scale;
    bool repeatU;
    bool repeatV;
};

vec4 render(RotatedSphericalTextureMaterial material, ExtVector v, vec2 uv) {
    vec4 origDir = vec4(vec2(cos(uv.x), sin(uv.x)) * sin(uv.y), cos(uv.y), 0.);
    vec4 rotatedDir = material.rotation * origDir;
    float sinPhi = length(rotatedDir.xy);
    float cosPhi = rotatedDir.z;
    float uCoord = -atan(rotatedDir.y, rotatedDir.x);
    float vCoord = atan(sinPhi, cosPhi);
    vec2 rotatedUV = vec2(uCoord, vCoord);
    vec2 texCoords = (rotatedUV - material.start) * material.scale;
    return texture(material.sampler, texCoords);
}


