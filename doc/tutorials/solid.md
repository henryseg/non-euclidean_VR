A {@link Solid} is defined as a {@link Shape} and a {@link Material}.
Its role is simply to wrap these data to pass them to the shader (with a proper ID).

To simplify the creation of scenes, 
it can be useful to build various extension of the {@link Solis} class, 
that will serve as shortcut to define a solid with a specific shape.
For an example, we refer the reader to euclidean balls in `js/geometries/euc/solids/Ball.js`.

# Class extension 

Every solid should extend the class {@link Solid}.
Note that {@link Solid} inherits from {@link Generic},
which defines methods various method to assign a UUID, a name, a scene ID, to the solid.

The constructor of {@link Solid} takes no argument.

# Properties and methods

The definition of a solid class does not require any particular property/method.
All is already taken care of by the class {@link Generic} from which it inherits. 