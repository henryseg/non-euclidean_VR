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


/**
 * Apply the given position to a vector.
 * @param[in] p a position
 * @param[in] v a vector **at the origin**.
 */
Vector applyPosition(Position p, Vector v){
    Vector res = applyFacing(p.facing, v);
    return applyIsometry(p.boost, res);
}


/***********************************************************************************************************************
 *
 * @struct RelVector
 * Structure for a generalized vector
 * Such a vector is a triple (local, cellBoost, invCellBoost) where
 * - local is a Vector
 * - cellBoost is an Isometry representing an element of a discrete subgroups
 * - invCellBoost is the inverse of cellBoost (to avoind unnecessary computation)
 * Such a generalized vector represent the vector local translated by cellBoost
 * It is meant to track easily teleportation when raymarching in quotient manifolds.
 *
 **********************************************************************************************************************/

struct RelVector {
    Vector local;
    Isometry cellBoost;
    Isometry invCellBoost;

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
 * Flow the given vector.
 * This method does apply any teleportation.
 * Hence the local part of the vector, may leaves the fundamental domain.
 */
RelVector flow(RelVector v, float t) {
    v.local = flow(v.local, t);
    return v;
}

/**
 * Compute (an approximation of) the vector obtained from `v` by moving the given direction.
 * Shift only the base point of the vector (does not update the direction).
 * This method is intended to numerically compute the gradient to a solid.
 * @param[in] v initial vector.
 * @param[in] dp the coordinate of the direction with repsect to the frame provided by frame()
 */
RelVector smallShift(RelVector v, vec3 dp){
    Point pos = smallShift(v.local.pos, dp);
    Vector local = Vector(pos, v.local.dir);
    return RelVector(local, v.cellBoost, v.invCellBoost);
}


/**
 * Compute the vector at the same point as `v` whose coordinates are given by the section of the frame bundle.
 * Overload of createVector
 */
RelVector createVector(RelVector v, vec3 coords){
    Vector local = createVector(v.local.pos, coords);
    return RelVector(local, v.cellBoost, v.invCellBoost);
}






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

/**
 * Apply the given position (including the cellBoost) to a vector.
 * @param[in] p a position
 * @param[in] v a vector **at the origin**.
 */
RelVector applyPosition(RelPosition position, Vector v) {
    Vector local = applyPosition(position.local, v);
    return RelVector(local, position.cellBoost, position.invCellBoost);
}