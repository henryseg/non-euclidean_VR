We explain here the requirement to define a new shape in a given geometry. For an example, we refer the reader to

- the definition of balls in `src/geometries/euc/shapes/ball` for a BasicShape.
- the union of shapes in `src/commons/shapes/union` for an AdvancedShape

# Class inheritance

A shape is defined by a JS class.

- If the shape is a basic shape (i.e., it is a stand-alone shape), then it should extend the class {@link BasicShape}.
- If the shape is an advanced shape (i.e., it relies on other shapes, as for boolean operations), then it should extend
  the class {@link AdvancedShape}.

Those two classes inherits from abstract class {@link Shape} which itself inherits from {@link Generic}, which defines
methods various method to assign a UUID, a name, a scene ID, to the shape.

The constructors of both {@link BasicShape} and {@link AdvancedShape} take a single argument of type {@link Isometry}.
This isometry is the position of the shape. By default, it encodes the absolute position of the shape. If the shape is
part of another advanced shape, then it corresponds to the position of the shape *relative to the position of the
advanced shape*

The class will inherit the method [addImport]{@link Generic#addImport} from {@link Generic}. This method can be called
in the constructor. Its purpose is to register chunk of GLSL code which are common to several classes (Shapes,
Materials, Solids, Lights, etc). The {@link ShaderBuilder} makes sure that each import is inserted only once in the
shader.

**Remark**. For the moment, there is actually no main difference between {@link BasicShape} and {@link AdvancedShape},
but this could change in the future.

**Remark**. A shape is meant to work in a specific geometry (e.g., a half-space in Nil cannot be used in Sol). However,
there is no check that the shape is used correctly. It is the duty of the person writing a scene to make sure that they
are not mixing shapes from different geometries.

# Properties and methods

Any class defining a shape needs to implement several methods/properties. Some of them are inherited by default from the
class {@link Shape} but can be overwritten.

- [isGlobal]{@link Shape#isGlobal} : boolean (getter):

  If true, the shape is global, that is it lives in the universal cover. If false the shape is local, that is it lives
  in the quotient manifold. If the getter is not implemented, the class will inherit from the one of {@link Shape} which
  always return true.

- [uniformType]{@link Generic#uniformType} : string(getter):

  It says what is the GLSL type used to represent this object.
    - If `uniformType` is non-empty, the data relative to the instance of this shape are passed to the shader as
      uniform (as the given type).
    - If `uniformType` is the empty string, no data is passed to the shader for the instances of this shape.

  If the getter is not implemented, the class will inherit from the one of {@link Generic} which always return the empty
  string.

  The GLSL type of a shape can be a custom structure. In this case the structure should be defined in the code return
  by `glslClass()` (see below).

- [hasUVMap]{@link Shape#hasUVMap} : boolean (getter):

  It says whether the shape comes with a UV map or not (e.g., for applying textures). If true, the class should implement
  the method `glslUVMap()` (see below).

  If the getter is not implemented, the class will inherit from the one of {@link Shape} which always return false.

- [absoluteIsom]{@link Shape#absoluteIsom} : Isometry (getter):

  It returns an isometry encoding the absolute position of the shape. That is if the shape is part of an advanced shape
  this property is computed recursively by multiplying the absolute isometry from the parent, with the (local) isometry
  from the current shape. If the isometry of the shape (or one of its parents) changes, this property is not updated
  automatically. The update is done by `updateAbsoluteIsom()` or `updateData()`

  *This getter should better not be overwritten*

- [absoluteIsomInv]{@link Shape#absoluteIsomInv} : Isometry (getter):

  Return the inverse of the absolute isometry.

  *This getter should better not be overwritten*

- [updateAbsoluteIsom]{@link Shape#updateAbsoluteIsom}() -> {void} (method):

  Recompute the value of `absoluteIsom` and `absoluteIsomInv`.

  *This method should better not be overwritten. It is recommended to use `updateData()` instead.*

- [updateData]{@link Shape#updateData}() -> {void} (method):

  Changing the isometry (encoding the location) of a shape can affect other properties. For instance if our shape is a
  ball, its center is the image of the origin by `absoluteIsom`. The update is not done automatically. The purpose of
  this method is to update all the properties that depends on `absoluteIsom`. This method should first call the
  method `updateData()` inherited from {@link Shape} using the line
  ```javascript
  super.updateData();
  ```
  The `updateData()` from the {@link Shape} class will in particular call `updateAbsoluteIsom()` and thus
  update `absoluteIsom` and `absoluteIsomInv`.

  **Remark.** A dirty way to handle the properties of the shape, it to pass `absoluteIsom` and `absoluteIsomInv` to the
  shader (using the properties of a custom GLSL type) and then recompute the value of the properties in the shader,
  everytime this is needed. However, this strategy is not very efficient. For performance purposes, it is better define
  all these properties on the Javascript side, pass them to the shader, and use `updateData()` when they need an update.

- [glslClass]{@link Generic.glslClass}() -> {string} (static function):

  It returns the chunk of GLSL code that is common to all instances of this shape. If `uniformType` return a custom GLSL
  type, then this GLSL code should define the corresponding structure. To each property used in the GLSL structure,
  should correspond a property of the JS class with the same name. Indeed, when the instance of this shape is passed to
  the shader, the JS sends the instance as a whole.

  If this function is not implemented, the class will inherit from the one of {@link Generic} which throws an error. If
  several instances of the same shape are added to the scene, the {@link ShaderBuilder} makes sure that this code is
  inserted only once in the shader.

- [glslSDF]{@link Shape#glslSDF}() -> {string} (method):

  It returns the chunk of GLSL code corresponding to the signed distance function of **this** instance of the shape. The
  signature of this GLSL function should be
  ```glsl
  float NAME_sdf(RelVector v);
  ```
  where `NAME` is the name of the instance of the object, computed by the getter `name` (inherited from {@link Generic})
  .

  If this method is not implemented, the class will inherit from the one of {@link Shape} which throws an error.

- [glslGradient]{@link Shape#glslGradient}() -> {string} (method):

  It returns the chunk of GLSL code corresponding to the gradient of the signed distance function of **this** instance
  of the shape. The signature of this GLSL function should be
  ```glsl
  RelVector NAME_gradient(RelVector v);
  ```
  where `NAME` is the name of the instance of the object, computed by the getter `name` (inherited from {@link Generic})
  .

  If this method is not implemented, the class will inherit from the one of {@link Shape}. This inherited method will
  return a chunk of code that estimates numerically the gradient (using the SDF).

- [glslUVMap]{@link Shape#glslUVMap}() -> {string} (method):

  It returns the chunk of GLSL code corresponding to the UV map of **this** instance of the shape. It is mandatory only
  if the getter `hasUVMap` returns true. The signature of this GLSL function should be
  ```glsl
  vec2 NAME_uvMap(RelVector v);
  ```
  where `NAME` is the name of the instance of the object, computed by the getter `name` (inherited from {@link Generic})
  .

  If this method is not implemented, the class will inherit from the one of {@link Shape} which throws an error.

- [setId]{@link Generic#setId}(scene: Scene) -> {void}:

  It sets the id of the shape in the scene. This method is called when the a solid using this shape is added to the
  scene. For a basic shape the method inherited from {@link Generic} should do the job. For advanced shape, the method
  should propagate `setId` to the shapes it is built on.

- [onAdd]{@link Generic#onAdd}(scene: Scene) -> {void}:

  It performs custom actions when the solid using this shape is added to the scene. By default, the method inherited
  from {@link Generic} does nothing.

- [shader]{@link Generic#shader}(shaderBuilder: ShaderBuilder) -> {void}

  It builds the chunk of GLSL code required to handle this instance of the shape. By default, the method inherited from
  {@link Generic} loads first the imports and the code from `glslClass()`, then eventually declares the shape as a
  uniform, and finally loads the code from `glslSDF()`, `glslGradient` and eventually `glslUVMap()`. For basic shape,
  this should do the job. For an advance shape the method should first propagate `shader` to the shapes it is built on.

In order to produce the GLSL functions `NAME_sdf`, `NAME_gradient`, and `NAME_uvMap`, one can use a template engine,
such as [mustache.js](https://github.com/janl/mustache.js/)
that will dynamically generate the code, with the appropriate name.

