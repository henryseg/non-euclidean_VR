Vector direction(Point p, Point q){
    vec3 pAux = p.coords.xyz;
    vec3 qAux = q.coords.xyz;
    float c = dot(pAux, qAux);
    float lenAux = abs(acos(c));
    vec3 dirAux = qAux - c * pAux;
    dirAux = (lenAux / sqrt(1. - c * c )) * dirAux;
    Vector res = Vector(p, vec4(dirAux, q.coords.w - p.coords.w));
    return geomNormalize(res);
}