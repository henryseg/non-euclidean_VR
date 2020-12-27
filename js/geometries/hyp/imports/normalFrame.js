// language=GLSL
export default `//

/**
 * Section of the frame bundle.
 * The section at the origin coincide with the reference frame.
 * In comparison to \`frame\` this section is more complicated, but orthonormal.
 * @param[in] p point on the geometry
 * @param[out] frame computed frame at the given point
 */
void normalFrame(Point p, out Vector[3] f){
    float x = p.coords.x;
    float y = p.coords.y;
    float z = p.coords.z;
    float w = p.coords.w;

    float aux = w * w + w + 1.;
    float den = w + 1.;
    vec4 dir0 = (1. / den) * vec4(aux, x * y, z * x, (w + 1.) * x);
    vec4 dir1 = (1. / den) * vec4(x * y, aux, y * z, (w + 1.) * y);
    vec4 dir2 = (1. / den) * vec4(z * x, y * z, aux, (w + 1.) * z);
    
    f[0] = Vector(p, dir0);
    f[1] = Vector(p, dir1);
    f[2] = Vector(p, dir2);
}
`;