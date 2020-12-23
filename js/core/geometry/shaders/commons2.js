// language=GLSL
export default `//

/***********************************************************************************************************************
 ***********************************************************************************************************************
 *
 * Geometric computations common to all the geometries (part 2)
 *
 ***********************************************************************************************************************
 **********************************************************************************************************************/

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
`;