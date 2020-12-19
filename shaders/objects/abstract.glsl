/***********************************************************************************************************************
 * @file
 * This file defines the basic structures needed to handle itmes (solids and lights)
 * Custom structures can be defined in the background of the item XML files (see items/model.xml)
 **********************************************************************************************************************/


/***********************************************************************************************************************
 *
 * @struct Item
 * Common denominator for light and objects
 * The property pos is not meant to be passed during the construction.
 * It will be computed later.
 * The flag `posFlag` is there to say if this computation has already been done.
 *
 **********************************************************************************************************************/
struct ObjectThurston{
    Position position;/**< the position of the item*/
    Point loc; /**< location of the object */
};

/***********************************************************************************************************************
 *
 * @struct Material
 * Material of an object in the scene
 * @todo enrich this structure to handle texture, formula based colors, etc
 *
 **********************************************************************************************************************/
struct Material {
    vec3 color; /**< base color */
    float ambient; /**< ambient reflection constant */
    float diffuse; /**< diffuse reflection constant */
    float specular; /**< specular reflection constant */
    float shininess; /**< shininess constant */
};


/***********************************************************************************************************************
 *
 * @struct Object
 * Object in the scene.
 *
 **********************************************************************************************************************/
struct Solid{
    ObjectThurston obj; /**< Underlying item */
    Material material; /**< material of the object */
};


/***********************************************************************************************************************
 *
 * @struct Light
 * Light in the scene
 * @todo How do we handle the intensity of the light? In a fourth channel for the color ?
 *
 **********************************************************************************************************************/
struct Light{
    ObjectThurston obj; /**< The underlying item */
    vec3 color; /**< The color of the light */
};

