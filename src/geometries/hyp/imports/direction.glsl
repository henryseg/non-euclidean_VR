Vector direction(Point p, Point q){
    vec4 dir;
    float c = hypDot(p.coords, q.coords);
    dir = q.coords + c * p.coords;
    dir = dir / sqrt(c * c  - 1.);
    Vector res = Vector(p, dir);
    return res;
}
