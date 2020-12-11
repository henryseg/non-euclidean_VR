/***********************************************************************************************************************
 * @mainpage
 * The shader is split in several files that need be concatenated as follows
 * - header.glsl (constants, uniforms)
 * - geometry/model.glsl (geometry functions)
 * - geometry/commons.glsl (common stuff)
 * - items/abstract.glsl (structures for objets and lights)
 * - background.glsl (block of code used by the subgroups of the items)
 * - setup.glsl (global variables, etc)
 * - sdf.glsl (basic signed distance functions / distance underestimators)
 * - subgroups.glsl (definition of the subgroups : teleportation and isometries)
 * - scene.glsl (the scene built by the JavaScript scene builder)
 * - raymarch.glsl (the ray-marching algorithm)
 * - lighting.glsl (scene illumination)
 * - main.glsl (wrapping up everything)
 *
 * The file geometry/model.glsl need be changed depending on the geometry.
 * The path of this file is specified in the JS geometry library load by the Thurston object
 * The other geometry depenedends sharders (definition of items, definition of subgroups)
 * are built by the Thurston object based on block of codes declared on the Javascript file.
 * (see items/model.xml and subgroups/model.xml).
 *
 * Sadly, OpenGL does not seem to allow overloading built-in functions.
 * Thus we followed the following naming rules.
 * The rules for naming functions are the following:
 * - If we are extending an GLSL function (e.g. dot, length, reflect, etc),
 * then we use the same name as the GLSL function prefixed by `geom`.
 * - If there is no analogue function (typically when we extend operators *,+,etc),
 * then we use the same name as the Three.js analogue
 **********************************************************************************************************************/


/***********************************************************************************************************************
 * @file
 * This file defines the constants of the shader, those constant are of two type
 * - hardcoded constants (e.g. the value of pi)
 * - parameters passed to the JS Thurston object as "shader constant"
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
 * Define here all the constants which are collected by the Thurston object.
 */
{{#constants}}
const {{type}} {{name}} = {{value}};
{{/constants}}


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

