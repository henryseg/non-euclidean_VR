/***********************************************************************************************************************
 * @file
 * This file is a model to impletement other geometries.
 * The content of the structures can be customized.
 * The signatures and the roles of each method need to be implemented strictly.
 **********************************************************************************************************************/



/***********************************************************************************************************************
 *
 * @struct Isometry
 * Structure for isometries of the geometry.
 *
 **********************************************************************************************************************/
struct Isometry{
// Define here the fields of the structure
};

/**
 * Identity isometry
 */
const Isometry IDENTITY = Isometry(); /**< Identity isometry */

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
struct Point{
// Define here the fields of the structure
};


const Point ORIGIN = Point(); /**< Origin of the geometry */

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
// Define here the other fields of the structure
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
 */
float geomDot(Vector v1, Vector v2) { }


/**
 * Translate the vector by the isometry.
 */
Vector applyIsometry(Isometry isom, Vector v) { }


/**
 * Rotate the given vector by a matrix representing an element of O(3).
 * @param[in] m an isometry of the tangent space. The matrix is written in the reference frame at the orign
 * @param[in] v a vector **at the origin**.
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
 * @deprecated The light directions are computed at the light level
 * @todo Write a better description?
 */
int directions(Point p, Point q, int n, out Vector[MAX_DIRS] dirs, out float[MAX_DIRS] lens){ }

/**
 * Flow the vector `v` for a time `t`.
 * The vector `v` is assume to be a **unit** vector
 */
Vector flow(Vector v, float t){ }

