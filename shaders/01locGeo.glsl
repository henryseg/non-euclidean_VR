//--------------------------------------------
// STRUCT Point
//--------------------------------------------


/*
    Data type for points in the space X
    A point x in X is represented by its coordinates (x,y,z,1)

*/

struct Point {
    vec4 coords;// the coordinates of the point, the last coordinate sould be 1
};


const Point ORIGIN = Point(vec4(0, 0, 0, 1));

// return the cylinder coordinates (rho, theta, z) of the point in the form (rho^2, theta, z)
// avoid one square root computation
vec3 toCylSq(Point p) {
    return vec3(
    pow(p.coords.x, 2.) + pow(p.coords.y, 2.),
    atan(p.coords.y, p.coords.x),
    p.coords.z
    );
}

// return the cylinder coordinates (rho, theta, z) of the point
vec3 toCyl(Point p) {
    vec3 aux = toCyl(p);
    return vec3(sqrt(aux.x), aux.yz);
}

//----------------------------------------------------------------------------------------------------------------------
// STRUCT Isometry
//----------------------------------------------------------------------------------------------------------------------

/*
  Data type for manipulating isometries of the space
  Isometries are represented by 4x4 matrices
*/

struct Isometry {
    mat4 mat;// the image of the origin by this isometry.
    bool nil;// say if the element is known to belong to nil (the normal transitive subgroup)
};


// Method to unserialized isometries passed to the shader
Isometry unserializeIsom(mat4 data) {
    return Isometry(data, false);
}

const Isometry identity = Isometry(mat4(1), true);
const Isometry flip = Isometry(mat4(
0, 1, 0, 0,
1, 0, 0, 0,
0, 0, -1, 0,
0, 0, 0, 1
), false);

// return the rotation around the z-axis by an angle alpha
Isometry rotation(float angle){
    mat4 mat = mat4(
    cos(angle), sin(agnle), 0, 0,
    -sin(angle), cos(angle), 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
    );
    return Isometry(mat, false);
}

// Return the isometry sending the origin to p
Isometry makeLeftTranslation(Point p) {
    // this is in COLUMN MAJOR ORDER so the things that LOOK LIKE ROWS are actually FUCKING COLUMNS!
    mat4 mat = mat4(
    1., 0., -p.coords.y/2., 0.,
    0., 1., p.coords.x/2., 0.,
    0., 0., 1., 0.,
    p.coords.x, p.coords.y, p.coords.z, 1.);
    return Isometry(mat, true);
}

// Return the isometry sending p to the origin
Isometry makeInvLeftTranslation(Point p) {
    mat4 mat = mat4(
    1., 0., p.coords.y/2., 0.,
    0., 1., -p.coords.x/2., 0.,
    0., 0., 1., 0.,
    -p.coords.x, -p.coords.y, -p.coords.z, 1.);
    return Isometry(mat, true);
}


// Product of two isometries (more precisely isom1 * isom2)
Isometry composeIsometry(Isometry isom1, Isometry isom2) {
    return Isometry(isom1.mat * isom2.mat, isom1.nil && isom2.nil);
}

// Return the inverse of the given isometry
Isometry getInverse(Isometry isom) {
    return Isometry(inverse(isom.mat), isom.nil);
}

// Translate a point by the given isometry
Point translate(Isometry isom, Point p) {
    return Point(isom.mat * p.coords);
}


//--------------------------------------------
// STRUCT Vector
//--------------------------------------------

/*
  Data type for manipulating points in the tangent bundler
  A Vector is given by
  - pos : a point in the space (as a Point object)
  - dir: a tangent vector at pos pulled back at the origin (the last coordinate should be zero)

  Implement various basic methods to manipulate them
*/

struct Vector {
    Point pos;// position on the manifold
    vec4 dir;// vector in the tangent space at the point pos
};


//--------------------------------------------
// LOCAL GEOMETRY
//--------------------------------------------

/*
  Methods perfoming computations in the tangent space at a given point.
*/

Vector add(Vector v1, Vector v2) {
    // add two tangent vector at the same point
    // TODO : check if the underlyig point are indeed the same ?
    return Vector(v1.pos, v1.dir + v2.dir);
}

Vector sub(Vector v1, Vector v2) {
    // subtract two tangent vector at the same point
    // TODO : check if the underlyig point are indeed the same ?
    return Vector(v1.pos, v1.dir - v2.dir);
}

Vector scalarMult(float a, Vector v) {
    // scalar multiplication of a tangent vector
    return Vector(v.pos, a * v.dir);
}

Vector translate(Isometry isom, Vector v) {
    // apply an isometry to the tangent vector (both the point and the direction)
    if (isom.nil) {
        return Vector(translate(isom, v.pos), v.dir);
    }
    else {
        Isometry shift = makeLeftTranslation(v.pos);
        Isometry shiftInv = makeInvLeftTranslation(v.pos);
        mat4 matDir = shift.mat * isom.mat * shiftInv.mat;
        return Vector(translate(isom, v.pos), matDir * v.dir);
    }
}

/*
Vector applyMatrixToDir(mat4 matrix, Vector v) {
    // apply the given given matrix only to the direction of the tangent vector
    return Vector(v.pos, matrix* v.dir);
}
*/

Vector rotateFacing(mat4 A, Vector v){
    // apply an isometry to the tangent vector (both the point and the direction)
    return Vector(v.pos, A*v.dir);
}

float tangDot(Vector u, Vector v){
    // dot product between two vectors in the tangent bundle
    // we assume that the underlying points are the same
    // recall that the direction are pull back at the origin
    // TODO : make a test if the underlying points are indeed the same ?
    return dot(u.dir, v.dir);
}

float tangNorm(Vector v){
    // calculate the length of a tangent vector
    return sqrt(abs(tangDot(v, v)));
}

Vector tangNormalize(Vector v){
    // create a unit tangent vector (in the tangle bundle)
    return Vector(v.pos, v.dir/tangNorm(v));
}

float cosAng(Vector u, Vector v){
    // cosAng between two vector in the tangent bundle
    return tangDot(u, v);
}

// return the opposite of the given tangent vector
Vector turnAround(Vector tv){
    return Vector(tv.pos, -tv.dir);
}


//reflect the unit tangent vector u off the surface with unit normal nVec
Vector reflectOff(Vector u, Vector nVec){
    return add(scalarMult(-2.0 * tangDot(u, nVec), nVec), u);
}


mat4 tangBasis(vec4 p){
    // return a basis of vectors at the point p

    /*
    vec4 basis_x = tangNormalize(p, vec4(p.w, 0.0, 0.0, p.x));
    vec4 basis_y = vec4(0.0, p.w, 0.0, p.y);
    vec4 basis_z = vec4(0.0, 0.0, p.w, p.z);
    //make this orthonormal
    basis_y = tangNormalize(p, basis_y - cosAng(p, basis_y, basis_x)*basis_x);// need to Gram Schmidt
    basis_z = tangNormalize(p, basis_z - cosAng(p, basis_z, basis_x)*basis_x - cosAng(p, basis_z, basis_y)*basis_y);
    mat4 theBasis=mat4(0.);
    */

    vec4 basis_x = vec4(1., 0., 0., 0.);
    vec4 basis_y = vec4(0., 1., 0., 0.);
    vec4 basis_z = vec4(0., 0., 1., 0.);
    mat4 theBasis=mat4(0.);
    theBasis[0]=basis_x;
    theBasis[1]=basis_y;
    theBasis[2]=basis_z;
    return theBasis;
}


/*
For the next four method,
we implictely assume that we have a prefered basis f = (f_x, f_y, f_z) at of the tangent space at the point p
The first function compute (an approximation of) the point obtained from p by following for a time eps
the path directed by the vector given in the coordinates of f
The last method takes the coordinates of a tangent vector in this basis and return the corresponding tangent vector
Here the basis at p is the image by dL of the standard basis at the origin.
*/


Point smallShift(Point p, vec3 dp) {
    // direction at the origin
    vec4 dirAtOrigin = vec4(dp, 0);
    Isometry shift = makeLeftTranslation(p);
    vec4 dirAtP = shift.mat * dirAtOrigin;
    return Point(p.coords + dirAtP);
}

Vector createVector(Point p, vec3 dp) {
    return Vector(p, vec4(dp, 0));
}



