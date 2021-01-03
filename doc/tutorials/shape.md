In this tutorial we will follow the example of a ball in the euclidean space.

# Class extension

In order to define a new kind of shape (in a given geometry) we have to build a new Javascript class.
- If the shape is a basic shape (i.e. it is a stand-alone shape),
then it should extend the class {@link BasicShape}.
- If the shape is an advanced shape (i.e. it relies on other shapes, as for boolean operations), 
then it should extend the class {@link AdvancedShape}.
  
(For the moment, there is actually no main difference between BasicShape and AdvancedShape,
but this could be useful in the future.)

Those two classes inherits from abstract class {@link Shape} which itself inherits from {@link Generic}, 
which defines methods various method to assign a UUID, a name, a scene ID, to the shape.

In our example, the definition of the class starts like this.
The constructor takes an input the center of the ball (which is a point in the geometry)
and the radius (which is a number).
Its first task is to call the constructor of the super class {@link BasicShape}.

```javascript
import {BasicShape} from "./js/core/shapes/BasicShape.js";

class BallShape extends BasicShape {

    constructor(center, radius) {
        super();
        this.center = center;
        this.radius = radius;
    }
    
    // Methods of the class
}
```

# Mandatory methods / properties

Any shape needs to implement several methods:
- a *getter* [`hasUVMap() -> {boolean}`]{@link Shape#hasUVMap}: 
  it says whether the shape comes with a UV map or not (e.g. for applying textures). 
  If the getter is not implemented, the class will inherit from the one of {@link Shape} which always return false.
- a *getter* [`uniformType() -> {string}`]{@link Generic#uniformType}:
  it says what is the GLSL struct used to represent this object.
  If the getter is not implemented, the class will inherit from the one of {@link Generic} which always return the empty string.
  This means that the shape will not be passed to the shader.
- a *getter* [`isGlobal() -> {boolean}`]{@link Generic#isGlobal}:
  if it returns true, the shape is global, that is it lives in the universal cover; 
  if it returns false the shape is local, that is it lives in the quotient manifold.
  If the getter is not implemented, the class will inherit from the one of {@link Generic} which always return true.
- a *static function* [`glslClass() -> {string}`]{@link Generic.glslClass}:
  it returns the chunk of GLSL code that is common to all shapes of the same type, 
  e.g. the corresponding structure, some basic functions associated to the structure, etc.
  If this function is not implemented, the class will inherit from the one of {@link Shape} which throws an error.
- a *method* [`glslSDF() -> {string}`]{@link Shape#glslSDF}:
  it returns the chunk of GLSL code corresponding to the signed distance function of **this** instance of the shape.
  If this method is not implemented, the class will inherit from the one of {@link Shape} which throws an error.
- a *method* [`glslGradient() -> {string}`]{@link Shape#glslGradient}:
  it returns the chunk of GLSL code corresponding to the gradient of the signed distance function of **this** instance of the shape.
  If this method is not implemented, the class will inherit from the one of {@link Shape}.
  This inherited method will return a chunk of code that estimates numerically the gradient (using the SDF)
- a *method* [`glslUVMap() -> {string}`]{@link Shape#glslUVMap}:
  it returns the chunk of GLSL code corresponding to the UV map of **this** instance of the shape.
  If this method is not implemented, the class will inherit from the one of {@link Shape} which throws an error.
  It is mandatory only if the getter `hasUVMap()` returns true.

# GLSL Code

While the Javascript class wil handle the logic needed for the shape *on the Javascript side*,
it also needs to provide the GLSL code for the shader to draw the shapes (essentially a SDF, a gradient function and a UV map).
Most of it is done via the methods/function starting with the `glsl` prefix.