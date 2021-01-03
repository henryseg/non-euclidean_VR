// language=GLSL
export default `//
/***********************************************************************************************************************
 ***********************************************************************************************************************
 *
 * Relative structures.
 * The following data handles objects which are translated by an element in a discrete subgroup
 *
 ***********************************************************************************************************************
 **********************************************************************************************************************/

/***********************************************************************************************************************
 *
 * @struct RelPosition
 * Structure for a generalized position in the geometry.
 * Such a position is a triple (local, cellBoost, invCellBoost) where
 * - local is a Position
 * - cellBoost is an Isometry representing an element of a discrete subgroups
 * - invCellBoost is the inverse of cellBoost (to avoind unnecessary computation)
 * Such a generalized position represent the position local translated by cellBoost
 * It is meant to track easily teleportation when raymarching in quotient manifolds.
 * This structure is essentially meant to receive data from the JS part
 *
 **********************************************************************************************************************/

struct RelPosition {
    Position local;
    Isometry cellBoost;
    Isometry invCellBoost;
};


/***********************************************************************************************************************
 *
 * @struct ExtVector
 * Structure for an extended vector
 * Such a vector is a tuple (local, cellBoost, invCellBoost, ...) where
 * - local is a Vector
 * - cellBoost is an Isometry representing an element of a discrete subgroups
 * - invCellBoost is the inverse of cellBoost (to avoind unnecessary computation)
 * - ... (more to come to handle fogs, reflexions, etc)
 * Such an extended vector represent the vector local translated by cellBoost
 * It is meant to track easily teleportation when raymarching in quotient manifolds.
 *
 **********************************************************************************************************************/

struct ExtVector {
    Vector local;
    Isometry cellBoost;
    Isometry invCellBoost;
};

/**
 * Normalize the given vector.
 */
ExtVector geomNormalize(ExtVector v){
    v.local = geomNormalize(v.local);
    return v;
}

/**
 * Return the opposition of the given vector
 */
ExtVector negate(ExtVector v){
    v.local = negate(v.local);
    return v;
}

/**
 * Flow the given vector.
 * This method does apply any teleportation.
 * Hence the local part of the vector, may leaves the fundamental domain.
 */
ExtVector flow(ExtVector v, float t) {
    v.local = flow(v.local, t);
    return v;
}

/**
 * Compute (an approximation of) the vector obtained from v by moving the given direction.
 * Shift only the base point of the vector (does not update the direction).
 * This method is intended to numerically compute the gradient to a solid.
 * @param[in] v initial vector.
 * @param[in] dp the coordinate of the direction with repsect to the frame provided by frame()
 */
ExtVector smallShift(ExtVector v, vec3 dp){
    Vector local = smallShift(v.local, dp);
    return ExtVector(local, v.cellBoost, v.invCellBoost);
}


/**
 * Compute the vector at the same point as v whose coordinates are given by the section of the frame bundle.
 * Overload of createVector
 */
ExtVector createVector(ExtVector v, vec3 coords){
    Vector local = createVector(v.local.pos, coords);
    return ExtVector(local, v.cellBoost, v.invCellBoost);
}

/**
 * Apply the given position (including the cellBoost) to a vector.
 * @param[in] p a position
 * @param[in] v a vector **at the origin**.
 */
ExtVector applyPosition(RelPosition position, Vector v) {
    Vector local = applyPosition(position.local, v);
    return ExtVector(local, position.cellBoost, position.invCellBoost);
}`;