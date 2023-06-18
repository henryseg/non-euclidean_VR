/***********************************************************************************************************************
 * Strips on a hyperbolic plane (represented as the Klein model).
 **********************************************************************************************************************/

struct ImprovedEquidistantSphStripsMaterial {
    float distance;
    float cosHalfWidthSq;
    float fadingAmplitude;
    vec3 stripColor;
    vec3 bgColor;
    mat4 rotation;
};

vec4 render(ImprovedEquidistantSphStripsMaterial material, ExtVector v, vec2 uv) {
    // apply the rotation
    vec4 origDir = vec4(vec2(cos(uv.x), sin(uv.x)) * sin(uv.y), cos(uv.y), 0.);
    vec4 rotatedDir = material.rotation * origDir;
    float sinPhi = length(rotatedDir.xy);
    float cosPhi = rotatedDir.z;
    float uCoord = atan(rotatedDir.y, rotatedDir.x);
    float vCoord = atan(sinPhi, cosPhi);
    vec2 rotatedUV = vec2(uCoord, vCoord);


    // for some obscure reason, if we use a value of ln(2) with too much precision, it breaks!
    float ln2 = 0.6931471; // ln(2) = 0.69314718055994529

    float theta = rotatedUV.x;
    float phi = rotatedUV.y;
    float k = round(theta / material.distance);
    theta = theta - k * material.distance;
    float aux = sin(phi) * sin(theta);
    float cosDistSq = 1. - aux * aux;

    // No need to compute all distances, it is enough to compare the square of their cosines
    if (cosDistSq < material.cosHalfWidthSq) {
        // outside of the strip, we return the background color
        return vec4(material.bgColor, 1);
    }
    if (k == 0.) {
        return vec4(material.stripColor, 1);
    }

    // inside of the strip, more computation is neeed to add the fading.
    // compute the largest power of two divinding k (using bitwise operators)
    int kInt = int(k);
    int nInt = kInt & (~kInt + 1);
    float n = float(nInt);
    // compute the value of phi1
    // such that the distance from (theta1, phi1) to the strip {theta = 0} equals theta0
    float theta0 = material.distance;
    float theta1 = n * theta0;

    // dirty hack for the half circle {theta = PI/2}
    //    if (theta1 > 0.75 * PI) {
    //        return vec4(material.stripColor, 1);
    //    }

    float c = 0.66;
    float sinPh1 = sin(c * theta0) / sin(theta1);
    float phi1 = asin(clamp(sinPh1, 0., 1.));

    float coeff = ((0.5 * PI - phi1) - abs(0.5 * PI - phi)) / material.fadingAmplitude + 0.5;
    coeff = clamp(coeff, 0., 1.);
    vec3 base = coeff * material.stripColor + (1. - coeff) * material.bgColor;
    return vec4(base, 1);

    //    float c = 0.66;
    //    // find the smallest n, so that the curve with phi cst can be subdivided into
    //    // N / 2^n segment of length at least c * material.distance where
    //    // N = 2 * pi / material.dist
    //    float n = ceil(-log(abs(sin(phi)) / c) / ln2);
    //
    //    float period = pow(2., n) * material.distance;
}