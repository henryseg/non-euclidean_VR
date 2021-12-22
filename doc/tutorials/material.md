We explain here the requirements to define a new material.
For examples, we refer the reader to
- the definition of the Phong material in `js/commons/material/phong`;
- the definition of the Checkerboard material in `js/commons/material/checkerboard`.

# Class inheritance

A material is a JS class.
It should extend the class {@link Material}.
Note that {@link Material} inherits from {@link Generic}, 
which defines methods various method to assign a UUID, a name, a scene ID, to the material. 

The constructor of {@link Material} does not take any argument.

# Properties and methods

Any class defining a custom material should implement several methods/properties.
Some of them are inherited by default from {@link Material} but can be overwritten.

- [uniformType]{@link Generic#uniformType} : string(getter):

  It says what is the GLSL type used to represent this material.
  - If `uniformType` is non-empty, the data relative to the instance of this material are passed to the shader as uniform (as the given type).
  - If `uniformType` is the empty string, no data is passed to the shader for the instances of this material.

  If the getter is not implemented, the class will inherit from the one of {@link Generic} which always return the empty string.

  The GLSL type of a material can be a custom structure.
  In this case the structure should be defined in the code return by `glslClass()` (see below).


- [usesNormal]{@link Material#usesNormal} : boolean (getter)
    
  The property should be true, if the normal to the shape is needed to compute its color with this material.
  
  In this case, the {@link AbstractRenderer} will make sure that the normal is computed, 
  before calling the color function of the material

- [usesUVMap]{@link Material#usesUVMap} : boolean (getter)
  
  The property should be true, if the UV coordinates of the shape are needed to compute its color with this material.
    
  In this case, the {@link AbstractRenderer} will make sure that the UV coordinates are computed,
  before calling the color function of the material.
  In addition, the {@link Solid} constructor throw an error if 
  the shape on which the material is applied does not implement UV coordinates.
  
- [usesLight]{@link Material#usesLight} : boolean (getter)

  The property should be true, if the material is sensitive to the lights in the scene.
    
  In this case, the property [lights]{@link Material#lights} is an array with all the lights that affect the material.
  If `lights` is not set up when the solid carrying the material is added to the scene, 
  then `lights` is set up to the list of lights in the scene.
  
- [isReflecting]{@link Material#isReflecting} : boolean (getter)

  The property should be true if the material is reflexive.
  
  In this case, the reflectivity should be set up in the variable [reflectivity]{@link Material#reflectivity}.
  This property is a Three.js Color. 
  Each channel (red, blue, green), interpreted as number between 0 and 1, is the reflectivity coefficient of the corresponding color
  (0 = no reflectivity, 1 = all light is reflected).


- [glslClass]{@link Generic.glslClass}() -> {string} (static function):

  It returns the chunk of GLSL code that is common to all instances of this material.
  If `uniformType` return a custom GLSL type, then this GLSL code should define the corresponding structure.
  To each property used in the GLSL structure, should correspond a property of the JS class with the same name.
  Indeed, when the instance of this material is passed to the shader, the JS sends the instance as a whole.

  If this function is not implemented, the class will inherit from the one of {@link Generic} which throws an error.

  If several instances of the same material are added to the scene,
  the {@link ShaderBuilder} makes sure that this code is inserted only once in the shader.
  
- [glslRender]{@link Material#glslRender}() -> {string} (method)

  It returns the chunk of GLSL code used to compute the color of **this instance** of the material.
  The GLSL should contain a function with one of the following signatures.
  ```
  vec3 NAME_render(ExtVector v)
  ```
  ```
  vec3 NAME_render(ExtVector v, RelVector normal)
  ```
  ```
  vec3 NAME_render(ExtVector v, vec2 uv)
  ```
  ```
  vec3 NAME_render(ExtVector v, RelVector normal, vec2 uv)
  ```
  where `NAME` is the name of the instance of the object, computed by the getter `name` (inherited from {@link Generic}). 
  The exact signature depends on whether the material requires a normal or UV coordinates.
  Here `v` is the vector obtained when we hit the shape.
  It should return the color as a vec3 of the material at the given point, 
  without taking into account the possible reflections.
  Reflections are automatically computed somewhere else in the shader.


# Wrapping material.

Defining a material that is affected by the lights can be strenuous,
as one needs to rebuild each time the functions handling interactions with lights.
To avoid this process one can proceed as follows.

1. Build a material `base` whose only job is to return the *intrinsic* color of the object
1. Wrap this material into another material with the command 
  ```javascript
  const material = phongWrap(base, params);
  ```

The {@link phongWrap} function takes a material and return a material. 
The material `base` passed in argument define the ambient color of the Phong model for the output material.
The parameters of the Phong model are passed in the object `params`.