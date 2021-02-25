// language=GLSL
export default `//
/**
 * Section of the frame bundle.
 * The section at the origin, should coincide with the reference frame.
 * @param[in] p point on the geometry
 * @param[out] frame computed frame at the given point
 * @todo Not completely convinced by this - and the function createVector() and smallShift().
 * If you know a better way to do it…
 */
void frame(Point p, out Vector[3] f){
    vec4 dir0 = vec4(p.coords.z, 0, -p.coords.x,0);
    vec4 dir1 = vec4(0, p.coords.z, -p.coords.y,0);
    vec4 dir2 = vec4(0, 0,0,1);
    dir0 = normalize(dir0);
    dir1 = normalize(dir1);
    //dir2 = normalize(dir2);
    f[0] = Vector(p, dir0);
    f[1] = Vector(p, dir1);
    f[2] = Vector(p, dir2);
}


/**
 * Compute (an approximation of) the point obtained from p by moving the given direction.
 * @param[in] p initial point.
 * @param[in] dp the coordinate of the direction with repsect to the frame provided by frame()
 */
Point smallShift(Point p, vec3 dp){
    Vector[3] f;
    frame(p, f);
    vec4 coords = p.coords + dp[0] * f[0].dir + dp[1] * f[1].dir + dp[2] * f[2].dir;
    Point res = Point(coords);
    return reduceError(res);
}


Vector smallShift(Vector v, vec3 dp){
    Point pos = smallShift(v.pos, dp);
    return Vector(pos,v.dir);
}


/**
 * Flow the vector v for a time t.
 * The vector v is assume to be a **unit** vector
 */
Vector flow(Vector v, float t){
    vec3 u=v.dir.xyz;
    float lambda=length(u);
    u=normalize(u);

    vec3 coords = cos(lambda*t) * v.pos.coords.xyz+ sin(lambda*t) * u;
    Point pos = Point(vec4(coords,v.pos.coords.w+t*v.dir.w));
                      
    vec3 dir = -sin(lambda*t) * v.pos.coords.xyz + cos(lambda*t) * v.dir.xyz;
    Vector res=Vector(pos,vec4(lambda*dir,v.dir.w));
    res=reduceError(res);
    return geomNormalize(res);
}
`;
