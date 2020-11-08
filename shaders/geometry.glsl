/***********************************************************************************************************************
 *
 * @struct Isometry
 * Structure for isometries of the geometry.
 *
 **********************************************************************************************************************/
struct Isometry{ };

/**
 * Identity isometry
 * @todo Check if one can build a structure as a constant, or does it have to be a global variable
 */
const Isometry IDENTITY; /**< Idendity isometry */
Isometry currentBoost; /**< Current boost */
Isometry leftBoost; /**< Left eye boost */
Isometry rightBoost; /**< Right eye boost */
Isometry cellBoost; /**< Cell boost */
Isometry invCellBoost; /**< Inverse of the cell boot */
Isometry objectBoost; /**< objetBoost (model for the template) */

/**
 * Convert the data passed to the shader into an isometry.
 * @param[in] rawA first part of a serialized isometry.
 * @param[in] rawB second part of a serialized isometry.
 */
Isometry unserializeIsom(mat4 rawA, float rawB) {

}

/**
 * Reduce the eventual numerical errors of the given isometry.
 */
Isometry reduceError(Isometry isom){}

/**
 * Multiply the two given isometries.
 */
Isometry multiply(Isometry isom1, Isometry isom2) {

}

/**
 * Return the inverse of the given isometry.
 */
Isometry getInverse(Isometry isom) { }

/***********************************************************************************************************************
 *
 * @struct Point
 * Structure for points in the geometry.
 *
 **********************************************************************************************************************/
struct Point{ };


const Point ORIGIN;///< Origin of the geometry

/**
 * Convert the data passed to the shader into an point.
 * @todo Decide which type of data is passed to the shader.
 */
Point unserializePoint(genType data) { }

/**
 * Reduce the eventual numerical errors of the given point.
 */
Point reduceError(Point p){}

/**
 * Translate the point by the isometry.
 */
Point translate(Isometry isom, Point p) { }

/**
 * Return a preferred isometry sending the origin to the given point.
 * Previously `makeLeftTranslation`.
 */

Isometry makeTranslation(Point p) { }

/**
 * Return a preferred isometry sending the given point to the origin.
 * Previously `makeInvLeftTranslation`.
 */
Isometry makeInvTranslation(Point p) { }

/***********************************************************************************************************************
 *
 * @struct Vector
 * Structure for vector in the tangent bundle of the geometry.
 * For computation of gradient, one needs to fix for each geometry, a section of the frame bundle.
 *
 **********************************************************************************************************************/
struct Vector{
    Point pos;///< Underlying point
};


const Vector E1;///< Reference frame at the origin (first vector)
const Vector E2;///< Reference frame at the origin (second vector)
const Vector E3;///< Reference frame at the origin (third vector)

/**
 * Convert the data passed to the shader into an vector.
 * @todo Decide which type of data is passed to the shader.
 */
Vector unserializeVector(genType data) { }

/**
 * Reduce the eventual numerical errors of the given vector.
 */
Vector reduceError(Vector v){}

/**
 * Add the given vectors.
 * @return v1 + v2
 */
Vector add(Vector v1, Vector v2){ }

/**
 * Subtrack the given vectors.
 * @return v1 - v2
 */
Vector sub(Vector v1, Vector v2){ }

/**
 * Multiply the vector by a scalar.
 * Previously `scalarMult`.
 * @return s * v
 */
Vector multiplyScalar(float s, Vector v){ }

/**
 * Return the opposite of the given vector.
 * Previously `turnAround`.
 * @return -v
 */
Vector negate(Vector v) {
    return multiplyScalar(-1., v);
}

/**
 * Return the dot product of the two vectors (with respect to the metric tensor).
 * Previouly `tangDot`.
 * Overload GLSL dot product (hopefully this is not an issue).
 */
float dot(Vector v1, Vector v2) { }

/**
 * Return the length of the given vector.
 * Previously `tangNorm`.
 * Overload GLSL dot product (hopefully this is not an issue).
 */
float length(Vector v){
    return sqrt(dot(v, v));
}

/**
 * Normalize the given vector (so that it has length one).
 * Previously `tangNormalize`.
 * Overload GLSL normalization (hopefully this is not an issue).
 */
Vector normalize(Vector v){
    float a = length(v);
    return multiplyScalar(1./a, v);
}

/**
 * Return the cosine of the angle between two vectors
 */
float cosAngle(Vector v1, Vector v2){
    float a1 = length(v1);
    float a2 = length(v2);
    return dot(v1, v2)/ (a1 * a2);
}

/**
 * Reflect the vector `v` across the plane whose normal is `n`.
 * Following the same convention as
 * <a href=" https://www.khronos.org/registry/OpenGL-Refpages/gl4/html/reflect.xhtml">OpenGL reflect</a>
 * @param[in] v the vector to reflect
 * @param[in] n the normal to the plane, it should be a unit vector
 * @returns the reflectec vector, i.e. v - 2 <v,n> n
 */
Vector reflect(Vector v, Vector n){
    return sub(v, multiplyScalar(2. * dot(v, n), n);
}


/**
 * Translate the vector by the isometry.
 */
Vector translate(Isometry isom, Vector v) { }

/**
 * Return a preferred isometry sending the origin to the underlying point.
 * Overlaod the function makeTranslation().
 */
Isometry makeTranslation(Vector p) {
    return makeTranslation(p.pos);
}

/**
 * Return a preferred isometry sending the underlying point to the origin.
 * Overlaod the function makeInvTranslation().
 */
Isometry makeInvTranslation(Vector v) {
    return makeInvTranslation(p.pos);
}

/**
 * Rotation the given vector by a matrix representing an element of O(3).
 * @todo Check where this is used. Does v need be a vector at the **origin**?
 */
Vector rotateByFacign(mat4 m, Vector v) { }


/**
 * Section of the frame bundle
 * @param[in] p point on the geometry
 * @param[out] frame computed frame at the given point
 * @todo Not completely convinced by this - and the function createVector() and smallShift().
 * If you know a better way to do it…
 */
void frame(Point p, out Vector[3] frame){ }

/**
 * Compute the vector at p whose coordinates are given by the section of the frame bundle.
 * See frame().
 */
Vector createVector(Point p, vec3 coords){
    Vector[3] frame;
    frame(p, frame);
    Vector c0 = multiplyScalar(coords[0], frame[0]);
    Vector c1 = multiplyScalar(coords[1], frame[1]);
    Vector c2 = multiplyScalar(coords[2], frame[2]);
    return add(c0, add(c1, c2));
}

/**
 * Compute (an approximation of) the point obtained from `p` by moving the given direction.
 * @param[in] p initial point.
 * @param[in] dp the coordinate of the direction with repsect to the frame provided by frame()
 */
Point smallShift(Point p, vec3 dp){ }

/**
 * Compute the directions of the geodesics starting at `p` and reaching `q`.
 * Each direction is stored in the array `dirs`.
 * In addition we also store ìn `lens` the length of the corresponding geodesic between `p` and `q`.
 * The function return the number of computed directions.
 * This number is always bounded above by MAX_DIRS (a global constant) and the paramter `n`.
 * @todo Write a better description?
 */
int directions(Point p, Point q, int n, out Vector[MAX_DIRS] dirs, out float[MAX_DIRS] lens){ }

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

/**
 * Let `p` and `q` be the underlying point of `u` and `v`.
 * Compute the direction and length of the geodesics from p to q.
 * Overlaod the function directions()
 */
int directions(Vector u, Vector v, int n, out Vector[MAX_DIRS] dirs, out float[MAX_DIRS] lens){
    return directions(u.pos, v.pos, n, dirs, lens);
}

/**
 * Let `p` and `q` be the underlying point of `u` and `v`.
 * Compute the direction and length of the shortest geodesic from `p` to `q`.
 * Overlaod the function direction()
 */
void direction(Vector u, Vector v, out Vector dir, out float len){
    return direction(u.pos, v.pos, dir, len);
}

/**
 * Flow the vector `v` for a time `t`.
 * The vector `v` is assume to be a **unit** vector
 */
Vector flow(Vector v, float t){ }