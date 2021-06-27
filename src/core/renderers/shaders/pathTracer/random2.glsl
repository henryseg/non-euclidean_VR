/**
 * Common random computation for the path tracer, second part (using relative vectors)
 *
 */


/**
 * Return a random unique vector with the same underlying point as the given vector
 * Work with relative vectors: the cellBoost is the one from the parameter
 * @param[in] v a vector providing the underlying point
 */
RelVector randomVector(RelVector v) {
    v.local = randomVector(v.local.pos);
    return v;
}