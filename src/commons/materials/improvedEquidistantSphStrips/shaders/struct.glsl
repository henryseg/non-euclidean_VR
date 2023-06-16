/***********************************************************************************************************************
 * Strips on a hyperbolic plane (represented as the Klein model).
 **********************************************************************************************************************/

struct ImprovedEquidistantSphStripsMaterial {
    float distance;
    float cosHalfWidthSq;
    vec3 stripColor;
    vec3 bgColor;
};

vec4 render(ImprovedEquidistantSphStripsMaterial material, ExtVector v, vec2 uv) {
    // for some obscure reason, if we use a value of ln(2) with too much precision, it breaks!
    float ln2 = 0.6931471; // ln(2) = 0.69314718055994529

    float theta = uv.x;
    float phi = uv.y;
    float c = 0.66;
    // find the smallest n, so that the curve with phi cst can be subdivided into
    // N / 2^n segment of length at least c * material.distance where
    // N = 2 * pi / material.dist
    float n = ceil(-log(abs(sin(phi)) / c) / ln2);

    float period = pow(2., n) * material.distance;
    theta = theta - round(theta / period) * period;
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