// language=GLSL
export default `//
Vector direction(Point p, Point q){
    vec4 dir;
    float c = hypDot(p.coords, q.coords);
    dir = q.coords + c * p.coords;
    dir = dir / sqrt(c * c  - 1.);
//    if (c > -10000.){
//        dir = q.coords + c * p.coords;
//        dir = dir / sqrt(c * c  - 1.);
//    }
//    else {
//        dir = - (1./c) * q.coords - p.coords;
//    }
    Vector res = Vector(p, dir);
    return res;
    //return geomNormalize(res);
}
`;