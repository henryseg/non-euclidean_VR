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
 * Return the zero vector at p
 */
Vector zeroVector(Point p){ }


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
