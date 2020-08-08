#version 300 es
out vec4 out_FragColor;

//----------------------------------------------------------------------------------------------------------------------
// Auxiliary methods: computations in SL(2,R)
//----------------------------------------------------------------------------------------------------------------------

/*

The elements of SL(2,R) seen as vectors in the basis E = (E0,E1,E2,E3)
See Jupyter Notebook
The elements satisfy the relation - x^2 - y^2 + z^2 + w^2 = -1

*/

// Correct the error to make sure that the point lies on the "hyperboloid"
vec4 SLreduceError(vec4 elt) {
    //float q = - elt.x * elt.x - elt.y * elt.y + elt.z * elt.z + elt.w * elt.w;
    mat4 J = mat4(
    -1, 0, 0, 0,
    0, -1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
    );
    float q = dot(elt, J * elt);
    return elt / sqrt(-q);
}

// change of model
// return the 2x2 matrix corresponding to elt
// Todo. Check if this is really needed
mat2 SLtoMatrix2(vec4 elt) {
    mat2 ex = mat2(
    1, 0,
    0, 1
    );
    mat2 ey = mat2(
    0, -1,
    1, 0
    );
    mat2 ez = mat2(
    0, 1,
    1, 0
    );
    mat2 ew = mat2(
    1, 0,
    0, -1
    );
    mat2 res = elt.x * ex + elt.y * ey + elt.z * ez + elt.w * ew;
    // reducing the eventual error
    res = res / sqrt(determinant(res));
    return res;
}
// change of model
// take a 2x2 matrix and return the corresponding element
vec4 SLfromMatrix2(mat2 m) {
    float a = m[0][0];
    float b = m[1][0];
    float c = m[0][1];
    float d = m[1][1];
    vec4 res = 0.5 * vec4(a + d, b - c, b + c, a - d);
    return SLreduceError(res);
}

// Projection from SL(2,R) to SO(2,1)
mat3 SLtoMatrix3(vec4 elt){
    mat4x3 aux1 = mat4x3(
    elt.x, elt.y, elt.z,
    -elt.y, elt.x, elt.w,
    elt.z, elt.w, elt.x,
    -elt.w, elt.z, elt.y
    );
    mat3x4 aux2 = mat3x4(
    elt.x, elt.y, elt.z, elt.w,
    -elt.y, elt.x, elt.w, -elt.z,
    elt.z, elt.w, elt.x, elt.y
    );
    mat3 res = aux1 * aux2;
    // TODO ? reduce errors to make sure the matrix belongs to SO(2,1) ?
    return res;
}

// Projection onto H^2
vec3 SLtoH2(vec4 elt) {
    mat3 m = SLtoMatrix3(elt);
    vec3 res = vec3(0., 0., 1.);
    res = m * res;
    // reduce the potential error
    // the point should be on a hyperboloid
    mat3 J = mat3(
    1, 0, 0,
    0, 1, 0,
    0, 0, -1
    );
    float q = dot(res, J * res);
    res = res / sqrt(-q);
    return res;
}

// Return the inverse of the given element
vec4 SLgetInverse(vec4 elt) {
    vec4 res = vec4(elt.x, -elt.y, -elt.z, -elt.w);
    return SLreduceError(res);
}

// Return the 4x4 Matrix, corresponding to the current element, seen as an isometry of SL(2,R)
mat4 SLtoMatrix4(vec4 elt) {
    mat4 res = mat4(
    elt.x, elt.y, elt.z, elt.w,
    -elt.y, elt.x, elt.w, -elt.z,
    elt.z, elt.w, elt.x, elt.y,
    elt.w, -elt.z, -elt.y, elt.x
    );
    return res;
}

// Multiply two elements of SL2 in the following order: elt1 * elt2
vec4 SLmultiply(vec4 elt1, vec4 elt2) {
    mat4 L1 = SLtoMatrix4(elt1);
    return SLreduceError(L1 * elt2);
}

// Translate the element by the given angle along the fiber
vec4 SLtranslateFiberBy(vec4 elt, float angle) {
    float aux = 0.5 * angle;
    mat4 T = mat4(
    cos(aux), sin(aux), 0., 0.,
    -sin(aux), cos(aux), 0., 0.,
    0., 0., cos(aux), -sin(aux),
    0., 0., sin(aux), cos(aux)
    );
    return SLreduceError(T * elt);
}

// Rotate the element by an angle alpha (see Jupyter Notebook)
vec4 SLrotateBy(vec4 elt, float angle) {
    mat4 R = mat4(
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, cos(angle), sin(angle),
    0, 0, -sin(angle), cos(angle)
    );
    return SLreduceError(R * elt);
}

// Flip the elemnt (see Jupyter Notebook)
vec4 SLflip(vec4 elt) {
    mat4 F = mat4(
    1, 0, 0, 0,
    0, -1, 0, 0,
    0, 0, 0, 1,
    0, 0, 1, 0
    );
    return SLreduceError(F * elt);
}


//----------------------------------------------------------------------------------------------------------------------
// STRUCT Point
//----------------------------------------------------------------------------------------------------------------------

/*

    Data type for points in the space X
    A point x in X is represented by a pair (proj,fiber) where
    - proj is the projection of x to SL(2,R) seen as a vec4 (in the basis E)
    - fiber is the fiber coordinates (!)

    The goal of this choice is to perform as many computations in SL(2,R) rather than in X.
    Hopefully this will reduce numerical errors (no need to go back and forth between SL2 and X).

*/

struct Point {
    vec4 proj;// the projection of the point to SL(2,R)
    float fiber;// the fiber component
};

// origin of the space
// - the projection corresponds to the identity in SL(2,R)
// - the fiber component is zero
const Point ORIGIN = Point(vec4(1, 0, 0, 0), 0.);

// change of model
// the input is a vector (x,y,z,w) representing a point p where
// - (x,y,z) is the projection of p in H^2 (hyperboloid model)
// - w is the fiber coordinate
Point fromVec4(vec4 p) {
    vec4 proj = vec4(
    sqrt(0.5 * p.z + 0.5),
    0.,
    p.x / sqrt(2. * p.z + 2.),
    p.y / sqrt(2. * p.z + 2.)
    );
    // SLtranslateFiberBy already reduces the error, no need to do it again after
    proj = SLtranslateFiberBy(proj, p.w);
    return Point(proj, p.w);
}

// change of model
// the output is a vector (x,y,z,w) representing a point p where
// - (x,y,z) is the projection of p in H^2 in the **hyperboloid** model
// - w is the fiber coordinate
vec4 toVec4(Point p) {
    vec4 res;
    // SLtoH2 already reduces the error, no need to do it again after
    res.xyz = SLtoH2(p.proj);
    res.w = p.fiber;
    return res;
}

// change of model
// the output is a vector (x,y,1,w) representing a point p where
// - (x,y) is the projection of p in H^2 in the **Klein** model
// - w is the fiber coordinate
vec4 toKlein(Point p){
    // toVec4 already reduces the error, no need to do it again after
    vec4 res = toVec4(p);
    res.xyz = res.xyz / res.z;
    return res;
}

// Perfom a rotation (meant in the H^2 component) by the given angle
// It does not affact the fiber component
Point rotateBy(Point p, float angle) {
    return Point(
    SLrotateBy(p.proj, angle),
    p.fiber
    );
}

// Flip the point (see Jupyter Notebook)
// It reverses the fiber
Point flip(Point p) {
    return Point(
    SLflip(p.proj),
    - p.fiber
    );
}


// unserialize the data received from the shader to create a point
Point unserializePoint(vec4 data) {
    return fromVec4(data);
}


//----------------------------------------------------------------------------------------------------------------------
// STRUCT Isometry
//----------------------------------------------------------------------------------------------------------------------

/*

  Data type for manipulating isometries of the space
  In this geometry we only consider as isometries the element of X acting on itself on the left.
  If x is a point of X, the isometry L_x sending the origin to x is represented by the point x

*/

struct Isometry {
    Point target;// the image of the origin by this isometry.
};

Isometry identity=Isometry(ORIGIN);

// Method to unserialized isometries passed to the shader
Isometry unserializeIsom(vec4 data) {
    Point p = fromVec4(data);
    return Isometry(p);
}

// Product of two isometries (more precisely isom1 * isom2)
Isometry composeIsometry(Isometry isom1, Isometry isom2) {
    Point target1 = isom1.target;
    Point target2 = isom2.target;
    float shift = target1.fiber + target2.fiber;
    // SLmultiply already reduces the error, no need to do it again after
    vec4 proj = SLmultiply(target1.proj, target2.proj);
    // SLtranslateFiberBy already reduces the error, no need to do it again after
    vec4 aux = SLtranslateFiberBy(proj, - shift);
    float fiber = shift + 2. * atan(aux.y, aux.x);
    Point target = Point(proj, fiber);
    return Isometry(target);
}

// Return the inverse of the given isometry
Isometry getInverse(Isometry isom) {
    // SLgetInverse already reduces the error, no need to do it again after
    vec4 proj = SLgetInverse(isom.target.proj);
    Point target = Point(proj, -isom.target.fiber);
    return Isometry(target);
}

// Return the isometry sending the origin to p
Isometry makeLeftTranslation(Point target) {
    return Isometry(target);
}

// Return the isometry sending p to the origin
Isometry makeInvLeftTranslation(Point p) {
    return getInverse(makeLeftTranslation(p));
}

// Translate a point by the given isometry
Point translate(Isometry isom, Point p) {
    Isometry aux = makeLeftTranslation(p);
    aux = composeIsometry(isom, aux);
    return aux.target;
}


//----------------------------------------------------------------------------------------------------------------------
// STRUCT Vector
//----------------------------------------------------------------------------------------------------------------------


/*
  Data type for manipulating points in the tangent bundle
  A Vector is given by
  - pos : a point in the space
  - dir: a tangent vector at pos

  Local direction are vec3 written in the orthonormal basis (e_x, e_y, e_phi) where
  . e_x is the direction of the x coordinate of H^2
  . e_y is the direction of the y coordinate in H^2
  . e_phi is the direction of the fiber

  Implement various basic methods to manipulate them

*/


struct Vector {
    Point pos;// position on the manifold
    vec3 dir;// pull back of the tangent vector at the origin written in the appropriate basis
};

//----------------------------------------------------------------------------------------------------------------------
// Conversion between global and local representations of tangent vectors
//----------------------------------------------------------------------------------------------------------------------

/*

The methods below compute (if needed) the global/local direction of the given tangent vector
The tangent vector is passed as a reference, hence it is altered by the function

*/

// Return the differential of the isometry sending the origin to target
mat4 diffTranslation(Point target) {
    vec4 aux = toVec4(target);
    float x = aux.x;
    float y = aux.y;
    float z = aux.z;
    float w = aux.w;
    float aux1 = x * cos(w) + y * sin(w);
    float aux2 = y * cos(w) - x * sin(w);

    // differential map of the translation from the origin to pos
    mat4 m = mat4(
    x * aux1 / (z + 1.) + cos(w), y * aux1 / (z + 1.) + sin(w), aux1, aux2 / (z + 1.),
    x * aux2 / (z + 1.) - sin(w), y * aux2 / (z + 1.) + cos(w), aux2, -aux1 / (z + 1.),
    0.5 * x, 0.5 * y, 0.5 * z + 0.5, 0.,
    0., 0., 0., 1.
    );

    return m;
}

// Return the inverse of the differential of the isometry sending the origin to target
mat4 diffInvTranslation(Point target) {
    vec4 aux = toVec4(target);
    float x = aux.x;
    float y = aux.y;
    float z = aux.z;
    float w = aux.w;
    float aux1 = x * cos(w) + y * sin(w);
    float aux2 = y * cos(w) - x * sin(w);

    // inverse of the differential map of the translation from the origin to pos
    mat4 m = mat4(
    cos(w), -sin(w), -2. * x / (z + 1.), - y / (z + 1.),
    sin(w), cos(w), -2. * y / (z + 1.), x / (z + 1.),
    - aux1 / (z + 1.), -aux2 / (z + 1.), 2. * z / (z + 1.), 0.,
    0., 0., 0., 1.
    );

    return m;
}


//----------------------------------------------------------------------------------------------------------------------
// Applying Isometries, Facings
//----------------------------------------------------------------------------------------------------------------------


// overlaod using Vector
Isometry makeLeftTranslation(Vector v) {
    return makeLeftTranslation(v.pos);
}

// overlaod using Vector
Isometry makeInvLeftTranslation(Vector v) {
    return makeInvLeftTranslation(v.pos);
}

// overload to translate a direction
Vector translate(Isometry isom, Vector v) {
    return Vector(
    translate(isom, v.pos),
    v.dir
    );
}


// rotate the tangent vector (position and direction around the fiber by an angle alpha)
Vector rotateBy(Vector v, float angle) {
    mat3 rotD = mat3(
    cos(angle), sin(angle), 0,
    -sin(angle), cos(angle), 0,
    0, 0, 1
    );

    return Vector(rotateBy(v.pos, angle), rotD * v.dir);
}

// flip the tangent vector (see Jupyter Notebook)
Vector flip(Vector v) {
    mat3 flipD = mat3(
    0, 1, 0,
    1, 0, 0,
    0, 0, -1
    );

    return Vector(flip(v.pos), flipD * v.dir);
}

// apply a local rotation of the direction
Vector rotateByFacing(mat4 mat, Vector v){
    // notice that the facing is an element of SO(3) which refers to the basis (e_x, e_y, e_w).
    vec4 aux = vec4(v.dir, 0.);
    aux = mat * aux;

    return Vector(v.pos, aux.xyz);
}


