# Defining a new solid

A [Solid](ref_solid) is defined as a [Shape](ref_shape) and a [Material](ref_material) (and eventually a [PTMaterial](ref_ptMaterial)). 
Its role is simply to wrap these data to pass them to the shader (with a proper ID).

To simplify the creation of scenes, it can be useful to build various extension of the [Solid](ref_solid) class, that will
serve as shortcut to define a solid with a specific shape. 
For an example, we refer the reader to euclidean balls
in `src/geometries/euc/solids/Ball.js`.

## Class extension

Every solid should extend the class {@link Solid}. Note that {@link Solid} inherits from {@link Generic}, which defines
methods various method to assign a UUID, a name, a scene ID, to the solid.

The constructor of {@link Solid} takes the following arguments

- shape [Shape](ref_shape) : a shape
- material [Material](ref_material) : a material (for basic rendering)
- ptMaterial[PTMaterial](ref_ptMaterial)) - optional : a material for path tracing

## Properties and methods

The definition of a solid class does not require any particular property/method. All is already taken care of by the
class [Generic](ref_generic) from which it inherits.
