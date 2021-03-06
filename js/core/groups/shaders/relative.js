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

/**
 * @deprecated
 * Use applyGroupElement instead
 */
Point applyIsometry(GroupElement elt, Point p){
    return applyIsometry(toIsometry(elt), p);
}

Point applyGroupElement(GroupElement elt, Point p){
    return applyIsometry(toIsometry(elt), p);
}

/**
 * @deprecated
 * Use applyGroupElement instead
 */
Vector applyIsometry(GroupElement elt, Vector v){
    return applyIsometry(toIsometry(elt), v);
}

Vector applyGroupElement(GroupElement elt, Vector v){
    return applyIsometry(toIsometry(elt), v);
}




/***********************************************************************************************************************
 *
 * @struct RelPosition
 * Structure for a generalized position in the geometry.
 * Such a position is a triple (local, cellBoost, invCellBoost) where
 * - local is a Position
 * - cellBoost is an GroupElement representing an element of a discrete subgroups
 * - invCellBoost is the inverse of cellBoost (to avoind unnecessary computation)
 * Such a generalized position represent the position local translated by cellBoost
 * It is meant to track easily teleportation when raymarching in quotient manifolds.
 * This structure is essentially meant to receive data from the JS part
 **********************************************************************************************************************/

struct RelPosition {
    Position local;
    GroupElement cellBoost;
    GroupElement invCellBoost;
};


/***********************************************************************************************************************
 *
 * @struct RelVector
 * Structure for a relative vector
 * Such a vector is a tuple (local, cellBoost, invCellBoost, ...) where
 * - local is a Vector
 * - cellBoost is an GroupElement representing an element of a discrete subgroups
 * - invCellBoost is the inverse of cellBoost (to avoind unnecessary computation)
 * Such a relative vector represent the vector local translated by cellBoost
 * It is meant to track easily teleportation when raymarching in quotient manifolds.
 **********************************************************************************************************************/

struct RelVector {
    Vector local;
    GroupElement cellBoost;
    GroupElement invCellBoost;
};

/**
 * Normalize the given vector.
 */
RelVector geomNormalize(RelVector v){
    v.local = geomNormalize(v.local);
    return v;
}

/**
 * Return the opposition of the given vector
 */
RelVector negate(RelVector v){
    v.local = negate(v.local);
    return v;
}

/**
 * Reflect the vector accrosse the plane defined by the given normal.
 * We assume that v and normal have the same cellBoost.
 */
RelVector geomReflect(RelVector v, RelVector normal){
    v.local = geomReflect(v.local, normal.local);
    return v;
}

/**
 * Flow the given vector.
 * This method does apply any teleportation.
 * Hence the local part of the vector, may leaves the fundamental domain.
 */
RelVector flow(RelVector v, float t) {
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
RelVector smallShift(RelVector v, vec3 dp){
    v.local = smallShift(v.local, dp);
    return v;
    //    Vector local = smallShift(v.local, dp);
    //    return RelVector(local, v.cellBoost, v.invCellBoost);
}


/**
 * Compute the vector at the same point as v whose coordinates are given by the section of the frame bundle.
 * Overload of createVector
 * We have to be careful, when using this function,
 * that the section of the frame bundle given by \`frame\` is NOT invariant under isometries.
 */
RelVector createVector(RelVector v, vec3 coords){
    v.local =  createVector(v.local.pos, coords);
    return v;
    //    Vector local = createVector(v.local.pos, coords);
    //    return RelVector(local, v.cellBoost, v.invCellBoost);
}

/**
 * Apply the given position (including the cellBoost) to a vector.
 * @param[in] p a position
 * @param[in] v a vector **at the origin**.
 */
RelVector applyPosition(RelPosition position, Vector v) {
    Vector local = applyPosition(position.local, v);
    return RelVector(local, position.cellBoost, position.invCellBoost);
}

/**
 * Return the "same" vector whose decomposition (cellBost, local) has been changed to (cellBoost * inv, elt * local)
 */
RelVector rewrite(RelVector v, GroupElement elt, GroupElement inv){
    v.local = applyGroupElement(elt, v.local);
    //v.local = reduceError(v.local);
    //v.local = geomNormalize(v.local);
    v.cellBoost = multiply(v.cellBoost, inv);
    v.invCellBoost = multiply(elt, v.invCellBoost);
    return v;
}


/***********************************************************************************************************************
 *
 * @struct ExtVector
 * Structure for an extended vector.
 * This structure is meant to follow vector during the ray-marching procedure.
 * It consists of 
 * - vector : the position and direction of the vector
 * - travelledDist : the distance travelled during the raymarching
 * - lastFlowTime : the time flowed during the last step
 * - isTeleported : a flag, boolean flag that is true, if the vector has been teleported in the last loop
 * - probably more to come
 *
 **********************************************************************************************************************/

struct ExtVector {
    RelVector vector;
    float lastFlowTime;
    float travelledDist;
    bool isTeleported;
};

ExtVector flow(ExtVector v, float t) {
    v.vector = flow(v.vector, t);
    v.lastFlowTime = t;
    v.travelledDist = v.travelledDist + t;
    return v;
}`;


