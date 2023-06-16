/***********************************************************************************************************************
 * Strips on a sphere, with spherical coordinates.
 **********************************************************************************************************************/

struct EquidistantSphStripsMaterial {
    float distance;
    float cosHalfWidthSq;
    vec3 stripColor;
    vec3 bgColor;
};


vec4 render(EquidistantSphStripsMaterial material, ExtVector v, vec2 uv) {
    float theta = uv.x;
    float phi = uv.y;
    theta = theta - round(theta / material.distance) * material.distance;
    float aux = sin(phi) * sin(theta);
    float cosDistSq = 1. - aux * aux;
    // No need to compute all distances, it is enough to compare the square of their cosines
    if (cosDistSq > material.cosHalfWidthSq) {
        return vec4(material.stripColor, 1);
    }
    else {
        return vec4(material.bgColor, 1);
    }
}