#version 300 es
/**
 * @mainpage
 * The shader is split in several files that need be concatenated as follows
 * - header.glsl (header, numerical constants, uniforms, etc)
 * - geometry.glsl (everything about the geometry)
 * - sdf.glsl (basic and compound signed distance functions / distance underestimators)
 * - scene.glsl (the scene built by the JavaScript scene builder)
 * - raymarch.glsl (the ray-marching algorithm)
 * - lighting.glsl (scene illumination)
 * - main.glsl (wrapping up everything)
 */

/**
 * Value of pi
 */
const float PI = 3.1415926538;

/**
 * Default debug color
 */
vec3 debugColor = vec3(0.5, 0, 0.8);

uniform int maxMarchinSteps; /**< Maximal number of steps before stoping the ray-marching. */
uniform float minDist; /**< Miniaml distance when starting the ray-marching. */
uniform float maxDist; /**< Maximal distance before stopping the ray-marching. */
uniform float threshold; /**< Threshold to decide if we hit an object in the scene. */
uniform float fov; /**< Field of view (in degrees). */
uniform bool stereo; /**< True for the stereographic vision. */
uniform vec2 resolution; /**< Screen resolution */

uniform mat4 currentBoostRawA; /**< Serialized boost of the current position, part A. */
uniform float currentBoostRawB; /**< Serialized boost of the current position, part B. */
uniform mat4 leftBoostRawA; /**< Serialized boost of the left eye position, part A. */
uniform float leftBoostRawB; /**< Serialized boost of the left eye position, part B. */
uniform mat4 rightBoostRawA; /**< Serialized boost of the right eye position, part A. */
uniform float rightBoostRawB; /**< Serialized boost of the right eye position, part B. */
uniform mat4 cellBoostRawA; /**< Serialized boost of the cell position, part A. */
uniform float cellBoostRawB; /**< Serialized boost of the cell position, part B. */
uniform mat4 invCellBoostRawA; /**< Serialized boost of inverse cell position, part A. */
uniform float invCellBoostRawB; /**< Serialized boost of inverse cell position, part B. */

uniform mat4 facing; /**< Main facing. */
uniform mat4 leftFacing; /**< Left eye facing. */
uniform mat4 rightFacing; /**< Right eye facing. */

uniform mat4 objetBoostRawA; /**< Serialized boost of the object, part A (model for the template). */
uniform float objectBootRawB; /**< Serialized boost of the object, part B (model for the template). */
uniform mat4 objectFacing; /**< Facing of the object (model for the template). */

