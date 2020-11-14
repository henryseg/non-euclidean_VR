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
  Isometry boost;/**< isometry part of the position */
  mat4 facing;/**< facing part of the position */
  Point pos; /**< location of the object */
  bool posFlag; /**< flag, true if the location has been computed false otherwise */
};

/**
 * Shortcut to create an item.
 * Take care of the properties `pos` and `posFlag`
 */
Item createItem(Isometry boost, mat4 facing){
  // the ORIGIN is just a placeholder here, since posFlag is set to false
  Item res = Item(boost, facing, ORIGIN, false);
  return res;
}

/**
 * Return the position as a Point of the given item
 */
Point getPosition(inout Item item) {
  if(!item.posFlag){
    item.pos = applyIsometry(item.boost, ORIGIN);
    item.posFlag = true;
  }
  return item.pos;
}

/**
 * Reset the flag `posFlag`.
 * This means that the next time `getPosition` is called,
 * the position will be recomputed.
 * useful if we update the `boost` and/or `facing` of the item.
 */
void resetPosition(inout Item item){
  item.posFlag = false;
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
    float specular; /**< specular reflection constant */
    float diffuse; /**< diffuse reflection constant */
    float ambient; /**< ambient reflection constant */
    float shininess; /**< shininess constant */
};


/***********************************************************************************************************************
 *
 * @struct Object
 * Object in the scene.
 *
 **********************************************************************************************************************/
struct Object{
  Item item; /**< Underlying item */
  Material material; /**< material of the object */
};

/**
 * Shortcut for creating objects
 */
Object createObject(Isometry boost, mat4 facing, Material material){
  Item item = createItem(boost, facing);
  return Object(item, material);
}

/**
 * Return the position as a Point of the given object.
 * Overload of `getPosition`
 */
Point getPosition(inout Object obj){
  return getPosition(obj.item);
}

/**
 * Reset the flag `posFlag`.
 * Overload of `resetPosition`.
 */
void resetPosition(inout Object obj){
  resetPosition(obj.item);
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
Light createLight(Isometry boost, mat4 facing, vec3 color){
  Item item = createItem(boost, facing);
  return Light(item, color);
}

/**
 * Return the position as a Point of the given light.
 * Overload of `getPosition`
 */
Point getPosition(inout Light light){
  return getPosition(light.item);
}

/**
 * Reset the flag `posFlag`.
 * Overload of `resetPosition`.
 */
void resetPosition(inout Light light){
  resetPosition(light.item);
}
