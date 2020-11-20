/***********************************************************************************************************************
 *
 * @struct Item
 * Common denominator for light and objects
 * The property pos is not meant to be passed during the construction.
 * It will be computed later.
 * The flag `posFlag` is there to say if this computation has already been done.
 *
 **********************************************************************************************************************/
struct Item{
  int id; /**< Identifyer of the item */
  Isometry boost;/**< isometry part of the position */
  mat4 facing;/**< facing part of the position */
  Point pos; /**< location of the object */
};

/**
 * Shortcut to create an item.
 * Take care of the properties `pos` and `posFlag`
 */
Item createItem(int id, Isometry boost, mat4 facing){
  // the ORIGIN is just a placeholder here, since posFlag is set to false
  Point pos = applyIsometry(boost, ORIGIN);
  Item res = Item(id, boost, facing, pos);
  return res;
}

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
  Item item; /**< Underlying item */
  Material material; /**< material of the object */
};

/**
 * Shortcut for creating objects
 */
Object createSolid(int id, Isometry boost, mat4 facing, Material material){
  Item item = createItem(id, boost, facing);
  return Solid(item, material);
}


/***********************************************************************************************************************
 *
 * @struct Light
 * Light in the scene
 * @todo How do we handle the intensity of the light? In a fourth channel for the color ?
 *
 **********************************************************************************************************************/
struct Light{
  Item item; /**< The underlying item */
  vec3 color; /**< The color of the light */
};


/**
 * Shortcut for creating lights
 */
Light createLight(int id, Isometry boost, mat4 facing, vec3 color){
  Item item = createItem(id, boost, facing);
  return Light(item, color);
}
