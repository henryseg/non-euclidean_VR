// language=GLSL
export default `//
Vector direction(Point p, Point q){
    float c = hypDot(p.coords, q.coords);
    vec4 dir = q.coords + c * p.coords;
    return geomNormalize(Vector(p, dir));
}
`;