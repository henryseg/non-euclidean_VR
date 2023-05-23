/***********************************************************************************************************************
 * Strips on a hyperbolic plane (represented as the Klein model).
 **********************************************************************************************************************/

struct EquidistantHypStripsMaterial {
    float distance;
    float width;
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

vec4 render(EquidistantHypStripsMaterial material, ExtVector v, vec2 uv) {
    vec2 p = vec2(uv.x, 0);
    float distP = distToYAxis(p);
    float k = round(distP / material.distance);
    vec2 q = horizontalTranslate(uv, -k * material.distance);
    float distQ = distToYAxis(q);
    if (abs(distQ) < material.width) {
        return vec4(material.stripColor, 1);
    }
    else {
        return vec4(material.bgColor, 1);
    }
}