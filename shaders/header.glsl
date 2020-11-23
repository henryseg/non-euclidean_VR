/**
 * @mainpage
 * The shader is split in several files that need be concatenated as follows
 * - header.glsl (constants, uniforms)
 * - geometry/euc.glsl (geometry functions)
 * - geometry/commons.glsl (common stuff)
 * - items/model.glsl (structures for objets and lights)
 * - setup.glsl (global variables, etc)
 * - sdf/euc.glsl (basic signed distance functions / distance underestimators)
 * - sdf/commons.glsl (common stuff)
 * - scene.glsl (the scene built by the JavaScript scene builder)
 * - raymarch.glsl (the ray-marching algorithm)
 * - lighting.glsl (scene illumination)
 * - main.glsl (wrapping up everything)
 *
 * The files geometry/euc.glsl and sdf/euc.glsl need be changed depending on the geometry.
 *
 * Sadly, OpenGL does not seem to allow overloading built-in functions.
 * Thus we followed the following naming rules.
 * The rules for naming functions are the following:
 * - If we are extending an GLSL function (e.g. dot, length, reflect, etc),
 * then we use the same name as the GLSL function prefixed by `geom`.
 * - If there is no analogue function (typically when we extend operators *,+,etc), then we use the same name as the Three.js analogue
 */

/**
 * Value of pi
 */
const float PI = 3.1415926538;

/**
 * Default debug color
 */
vec3 debugColor = vec3(0.5, 0, 0.8);

/**
 * The maximal number of direction used for each light.
 * This number needs to be a constant and cannot be passed a uniform.
 * Hence it will be setup once for all via the JavaScript template engine.
 */


{{#constants}}
const {{type}} {{name}} = {{value}};
{{/constants}}

{{#uniforms}}
uniform {{type}} {{name}};
{{/uniforms}}

