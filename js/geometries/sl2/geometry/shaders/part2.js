// language=GLSL
export default `//
/***********************************************************************************************************************
 ***********************************************************************************************************************
 *
 * Implementation of the geometry of SL(2,R) (part 2)
 *
 ***********************************************************************************************************************
 **********************************************************************************************************************/

/**
 * Section of the frame bundle.
 * The section at the origin, should coincide with the reference frame.
 * @param[in] p point on the geometry
 * @param[out] frame computed frame at the given point
 * @todo Not completely convinced by this - and the function createVector() and smallShift().
 * If you know a better way to do it…
 */
void frame(Point p, out Vector[3] f){
    f[0] = Vector(p, vec3(1, 0, 0));
    f[1] = Vector(p, vec3(0, 1, 0));
    f[2] = Vector(p, vec3(0, 0, 1));
}

/**
 * Section of the orthonormal frame bundle.
 * The section at the origin, should coincide with the reference frame.
 * @param[in] p point on the geometry
 * @param[out] frame computed frame at the given point
 */
void orthoFrame(Point p, out Vector[3] f){
    f[0] = Vector(p, vec3(1, 0, 0));
    f[1] = Vector(p, vec3(0, 1, 0));
    f[2] = Vector(p, vec3(0, 0, 1));
}

/**
 * Compute (an approximation of) the point obtained from p by moving the given direction.
 * @param[in] p initial point.
 * @param[in] dp the coordinate of the direction with respect to the frame provided by frame()
 */
Point smallShift(Point p, vec3 dp){
    // direction dp pushed at the origin in SL(2,R)
    vec4 SLdirAtOrigin = 0.5 * vec4(0, dp.z, dp.x, dp.y);
    // direction dp pushed at p.proj in SL(2,R)
    vec4 SLdirAtP =  SLtoMatrix4(p.proj) * SLdirAtOrigin;

    // fiber component of the direction pushed at p
    float den = p.proj.x * p.proj.x + p.proj.y * p.proj.y;
    float coeffX = (p.proj.x * p.proj.w - p.proj.y * p.proj.z) / den;
    float coeffY = -(p.proj.x * p.proj.z + p.proj.y * p.proj.w) / den;
    float dfiberAtP = coeffX * dp.x + coeffY * dp.y + dp.z;

    vec4 newProj = SLreduceError(p.proj + SLdirAtP);
    float newFiber = p.fiber + dfiberAtP;

    return Point(newProj, newFiber);
}

Vector smallShift(Vector v, vec3 dp){
    Point pos = smallShift(v.pos, dp);
    return Vector(pos, v.dir);
}


/**
 * Flow the vector v for a time t.
 * The vector v is assume to be a **unit** vector
 */
Vector flow(Vector v, float t){
    Vector res;

    float c = v.dir.z;
    float a = sqrt(1. - c * c);
    float absC = abs(c);

    vec4 spin = vec4(cos(c * t), sin(c * t), 0, 0);
    vec4 trans;
    float omega, tanTheta;
    res.pos.fiber = 2. * c * t;

    if (a == absC){
        trans = vec4(
        1.,
        -0.25 * sqrt(2.) * t,
        0.5 * t,
        0);
        tanTheta = -0.25 * sqrt(2.) * t;
        res.pos.fiber = res.pos.fiber + 2. * atan(tanTheta);
    } else if (a > absC){
        omega = sqrt(a * a - c * c);
        trans = vec4(
        cosh(0.5 * omega * t),
        -(c / omega) * sinh(0.5 * omega * t),
        (1. / omega) * sinh(0.5 * omega * t),
        0);
        tanTheta = - (c / omega) * tanh(0.5 * omega * t);
        res.pos.fiber = res.pos.fiber + 2. * atan(tanTheta);
    } else if (a < absC){
        omega = sqrt(c * c - a * a);
        trans = vec4(
        cos(0.5 * omega * t),
        -(c / omega) * sin(0.5 * omega * t),
        (1. / omega) * sin(0.5 * omega *t),
        0
        );
        tanTheta = - (c / omega) * tan(0.5 * omega *t);
        float n = floor(0.5 * omega * t / PI + 0.5);
        if (c < 0.){
            n = -n;
        }
        res.pos.fiber = res.pos.fiber + 2. * atan(tanTheta) - 2. * n * PI;
    }

    res.pos.proj = SLmultiply(trans, spin);
    mat2 rotation = mat2(
    v.dir.x, v.dir.y,
    -v.dir.y, v.dir.x
    );
    res.pos.proj.zw = rotation * res.pos.proj.zw;

    // update the direction of the tangent vector
    // recall that tangent vectors at the origin have the form (ux,uy,uw)
    // so we work with 3x3 matrics applied to local_dir
    mat3 S = mat3(
    cos(2. * c * t), -sin(2. * c * t), 0.,
    sin(2. * c * t), cos(2. * c * t), 0.,
    0., 0., 1.
    );
    res.dir = S * v.dir;

    Isometry isom = makeTranslation(v.pos);
    res = applyIsometry(isom, res);
    return res;
}


`;
