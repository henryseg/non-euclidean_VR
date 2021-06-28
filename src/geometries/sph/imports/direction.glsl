/**
 * Driection from p to q
 */
Vector direction(Point p, Point q) {
    float c = dot(p.coords, q.coords);
    vec4 dir = q.coords - c * p.coords;
    return geomNormalize(Vector(p, dir));
}