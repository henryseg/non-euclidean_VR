// language=GLSL
export default `//
/***********************************************************************************************************************
 ***********************************************************************************************************************
 *
 * Hardcoded constants (e.g. the value of pi)
 *
 ***********************************************************************************************************************
 **********************************************************************************************************************/

/**
 * Value of pi
 */
const float PI = 3.1415926538;

/**
 * Default debug color
 */
vec3 debugColor = vec3(0.5, 0, 0.8);

/**
 * Value of hit when we hit nothing.
 * @const
 */
const int HIT_NOTHING = 0;
/**
 * Value of hit when we hit a solid.
 * @const
 */
const int HIT_SOLID = 1;
/**
 * Value of hit when we hit a bug!
 * @const
 */
const int HIT_DEBUG = -1;

`;