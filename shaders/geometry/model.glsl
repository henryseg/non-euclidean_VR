/**
 * @file
 * This file is a model to impletement other geometries.
 * The content of the structures can be customized.
 * The signatures and the roles of each method need to be implemented strictly.
 */



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
const Isometry IDENTITY; /**< Identity isometry */

/**
 * Convert the data passed to the shader into an isometry.
 * @param[in] rawA first part of a serialized isometry.
 * @param[in] rawB second part of a serialized isometry.
 */
Isometry unserializeIsom(mat4 rawA, float rawB) { }

/**
 * Reduce the eventual numerical errors of the given isometry.
 */
Isometry reduceError(Isometry isom){ }

/**
 * Multiply the two given isometries.
 */
Isometry multiply(Isometry isom1, Isometry isom2) { }

/**
 * Return the inverse of the given isometry.
 */
Isometry geomInverse(Isometry isom) { }

/***********************************************************************************************************************
 *
 * @struct Point
 * Structure for points in the geometry.
 *
 **********************************************************************************************************************/
struct Point{ };


const Point ORIGIN; /**< Origin of the geometry */

/**
 * Convert the data passed to the shader into an point.
 * @todo Decide which type of data is passed to the shader.
 */
Point unserializePoint(genType data) { }

/**
 * Reduce the eventual numerical errors of the given point.
 */
Point reduceError(Point p){ }

/**
 * Translate the point by the isometry.
 */
Point applyIsometry(Isometry isom, Point p) { }

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
    Point pos; /**< Underlying point */
};


/**
 * Reduce the eventual numerical errors of the given vector.
 */
Vector reduceError(Vector v){ }

/**
 * Add the given vectors.
 * @return @f$ v_1 + v_2 @f$
 */
Vector add(Vector v1, Vector v2){ }

/**
 * Subtrack the given vectors.
 * @return @f$ v_1 - v_2 @f$
 */
Vector sub(Vector v1, Vector v2){ }

/**
 * Multiply the vector by a scalar.
 * Previously `scalarMult`.
 * @return @f$ s v @f$
 */
Vector multiplyScalar(float s, Vector v){ }

/**
 * Return the dot product of the two vectors (with respect to the metric tensor).
 * Previouly `tangDot`.
 * Overload GLSL dot product (hopefully this is not an issue).
 */
float geomDot(Vector v1, Vector v2) { }


/**
 * Translate the vector by the isometry.
 */
Vector applyIsometry(Isometry isom, Vector v) { }


/**
 * Rotation the given vector by a matrix representing an element of O(3).
 * @todo Check where this is used. Does v need be a vector at the **origin**?
 */
Vector applyFacing(mat4 m, Vector v) { }


/**
 * Section of the frame bundle.
 * The section at the origin, should coincide with the reference frame.
 * @param[in] p point on the geometry
 * @param[out] frame computed frame at the given point
 * @todo Not completely convinced by this - and the function createVector() and smallShift().
 * If you know a better way to do it…
 */
void frame(Point p, out Vector[3] frame){ }


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
 * Flow the vector `v` for a time `t`.
 * The vector `v` is assume to be a **unit** vector
 */
Vector flow(Vector v, float t){ }
