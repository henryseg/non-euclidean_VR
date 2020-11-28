/***********************************************************************************************************************
 *
 * @file
 * Geometric computations common to all the geometries
 *
 **********************************************************************************************************************/


/**
 * Return the opposite of the given vector.
 * Previously `turnAround`.
 * @return -v
 */
Vector negate(Vector v) {
    return multiplyScalar(-1., v);
}


/**
 * Return the length of the given vector.
 * Previously `tangNorm`.
 * Overload GLSL dot product (hopefully this is not an issue).
 */
float geomLength(Vector v){
    return sqrt(geomDot(v, v));
}

/**
 * Normalize the given vector (so that it has length one).
 * Previously `tangNormalize`.
 * Overload GLSL normalization (hopefully this is not an issue).
 */
Vector geomNormalize(Vector v){
    float a = geomLength(v);
    return multiplyScalar(1./a, v);
}

/**
 * Return the cosine of the angle between two vectors
 */
float cosAngle(Vector v1, Vector v2){
    float a1 = geomLength(v1);
    float a2 = geomLength(v2);
    return geomDot(v1, v2)/ (a1 * a2);
}

/**
 * Reflect the vector `v` across the plane whose normal is `n`.
 * Following the same convention as
 * <a href=" https://www.khronos.org/registry/OpenGL-Refpages/gl4/html/reflect.xhtml">OpenGL reflect</a>
 * @param[in] v the vector to reflect
 * @param[in] n the normal to the plane, it should be a unit vector
 * @returns the reflectec vector, i.e. @f$ v - 2 \left<v,n\right> n @f$
 */
Vector geomReflect(Vector v, Vector n){
    return sub(v, multiplyScalar(2. * geomDot(v, n), n));
}

/**
 * Return a preferred isometry sending the origin to the underlying point.
 * Overlaod the function makeTranslation().
 */
Isometry makeTranslation(Vector v) {
    return makeTranslation(v.pos);
}

/**
 * Return a preferred isometry sending the underlying point to the origin.
 * Overlaod the function makeInvTranslation().
 */
Isometry makeInvTranslation(Vector v) {
    return makeInvTranslation(v.pos);
}


/**
 * Compute the vector at p whose coordinates are given by the section of the frame bundle.
 * See frame().
 */
Vector createVector(Point p, vec3 coords){
    Vector[3] f;
    frame(p, f);
    Vector c0 = multiplyScalar(coords[0], f[0]);
    Vector c1 = multiplyScalar(coords[1], f[1]);
    Vector c2 = multiplyScalar(coords[2], f[2]);
    return add(c0, add(c1, c2));
}

/**
 * Compute the direction and length of the shortest geodesic from `p` to `q`.
 * The result are passed to the variables `dir` and `len`.
 */
void direction(Point p, Point q, out Vector dir, out float len){
    Vector[MAX_DIRS] dirs;
    float[MAX_DIRS] lens;
    directions(p, q, 1, dirs, lens);
    dir = dirs[0];
    len = lens[0];
}


/***********************************************************************************************************************
 *
 * @struct Position
 * Structure for position (boost and facing) in the geometry.
 * This structure is essentially meant to receive data from the JS part
 *
 **********************************************************************************************************************/

struct Position {
    Isometry boost;
    mat4 facing;
};

Vector applyPosition(Position p, Vector v){
    Vector res = applyFacing(p.facing, v);
    return applyIsometry(p.boost, res);
}


/***********************************************************************************************************************
 *
 * @struct GenVector
 * Structure for a generalized vector
 * Such a vector is a triple (cellBoost, invCellBoost, vec) where
 * - cellBoost is an Isometry representing an element of a discrete subgroup
 * - invCellBoost is the inverse of cellBoost (to avoind unnecessary computation)
 * - vec is a Vector
 * Such a generalized vector represent the vector vec translated by cellBoost
 * It is meant to track easily teleportation when raymarching in quotient manifolds.
 *
 * inside is a flag used during teleportation.
 * inside will not be turned to true, unless the vector has been moved back in the fundamental domain.
 *
 **********************************************************************************************************************/

struct GenVector {
    Isometry cellBoost;
    Isometry invCellBoost;
    Vector vec;
};

GenVector geomNormalize(GenVector v){
    v.vec = geomNormalize(v.vec);
    return v;
}

GenVector flow(GenVector v, float t) {
    v.vec = flow(v.vec, t);
    return v;
}


/***********************************************************************************************************************
 *
 * @struct GenPosition
 * Structure for a generalized position (subgroup element, boost and facing) in the geometry.
 * This structure is essentially meant to receive data from the JS part
 *
 **********************************************************************************************************************/

struct GenPosition {
    Isometry boost;
    mat4 facing;
    Isometry cellBoost;
    Isometry invCellBoost;
};

Vector applyLocalPosition(GenPosition p, Vector v){
    Vector res = applyFacing(p.facing, v);
    return applyIsometry(p.boost, res);
}

Vector applyPosition(GenPosition p, Vector v){
    Vector res = applyLocalPosition(p, v);
    return applyIsometry(p.cellBoost, res);
}