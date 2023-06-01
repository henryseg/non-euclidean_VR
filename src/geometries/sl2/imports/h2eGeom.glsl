// Auxiliary function : lorentzian geometry in R^3

float H2EhypDot(vec3 v1, vec3 v2){
    return v1.x * v2.x + v1.y * v2.y - v1.z * v2.z;
}

float H2EhypLengthSq(vec3 v) {
    return abs(H2EhypDot(v, v));
}

float H2EhypLength(vec3 v) {
    return sqrt(H2EhypLengthSq(v));
}

// Same with vec4 (ignoring the last coordinates)

float H2EhypDot(vec4 v1, vec4 v2){
    return H2EhypDot(v1.xyz, v2.xyz);
}

float H2EhypLengthSq(vec4 v) {
    return abs(H2EhypDot(v, v));
}

float H2EhypLength(vec4 v) {
    return sqrt(H2EhypLengthSq(v));
}




// Warning: the output is not in the form of an SL2 Vector.
// moreover it is not normalized...

vec4 H2Edirection(vec4 p, vec4 q){
    vec3 pAux = p.xyz;
    vec3 qAux = q.xyz;
    float c = H2EhypDot(pAux, qAux);
    float lenAux = acosh(-c);
    vec3 dirAux = qAux + c * pAux;
    dirAux = (lenAux / sqrt(c * c  - 1.)) * dirAux;
    return vec4(dirAux, q.w - p.w);
}