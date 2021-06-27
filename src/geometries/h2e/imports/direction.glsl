Vector direction(Point p, Point q){
    vec3 pAux = p.coords.xyz;
    vec3 qAux = q.coords.xyz;
    float c = hypDot(pAux, qAux);
    float lenAux = acosh(-c);
    vec3 dirAux = qAux + c * pAux;
    dirAux = (lenAux / sqrt(c * c  - 1.)) * dirAux;
    Vector res = Vector(p, vec4(dirAux, q.coords.w - p.coords.w));
    return geomNormalize(res);
}
