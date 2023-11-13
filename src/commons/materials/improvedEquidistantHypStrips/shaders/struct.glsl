/***********************************************************************************************************************
 * Strips on a hyperbolic plane (represented as the Klein model).
 **********************************************************************************************************************/

struct ImprovedEquidistantHypStripsMaterial {
    float distance;
    float halfWidth;
    vec3 stripColor;
    vec3 bgColor;
};

/*
 * Given a point m = (x,y) in the Klein model of the hyperbolic space
 * return the (algebraic) distance from m to the vertical geodiesc {x = 0}.
 */
float distToYAxis(vec2 m) {
    float aux = sqrt(1. - m.y * m.y);
    return 0.5 * log((aux + m.x) / (aux - m.x));
}

/* Return the image of the point m = (x,y) in the Klein model of the hyperbolic space
 * by the translation of length t along the x-axis
 */
vec2 horizontalTranslate(vec2 m, float t) {
    float ch = cosh(t);
    float sh = sinh(t);
    float x = m.x * ch + sh;
    float den = m.x * sh + ch;
    return vec2(x / den, m.y / den);
}

vec4 render(ImprovedEquidistantHypStripsMaterial material, ExtVector v, vec2 uv) {
    float t = atanh(uv.x) - material.distance;
    vec2 m = horizontalTranslate(uv, -t);
    float distM = abs(distToYAxis(m));
    float n = floor(log(distM / material.distance) / log(2.));

    float distP = atanh(uv.x);
    float period = pow(2., -n) * material.distance;
    float k = round(distP / period);
    vec2 q = horizontalTranslate(uv, -k * period);
    float distQ = distToYAxis(q);
    if (abs(distQ) < material.halfWidth) {
        return vec4(material.stripColor, 1);
    }
    else {
        return vec4(material.bgColor, 1);
    }
}