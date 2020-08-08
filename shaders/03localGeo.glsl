//----------------------------------------------------------------------------------------------------------------------
// LOCAL GEOMETRY
//----------------------------------------------------------------------------------------------------------------------

/*
  Methods perfoming computations in the tangent space at a given point.
*/


// Add two tangent vector at the same point (return v1 + v2)
Vector add(Vector v1, Vector v2) {
    // return the added vectors
    return Vector(v1.pos, v1.dir + v2.dir);
}

// subtract two tangent vector at the same point (return v1 - v2)
Vector sub(Vector v1, Vector v2) {
    // return the added vectors
    return Vector(v1.pos, v1.dir - v2.dir);
}

// scalar multiplication of a tangent vector (return a * v)
Vector scalarMult(float a, Vector v) {
    return Vector(v.pos, a * v.dir);
}


// dot product of the two vectors
float tangDot(Vector v1, Vector v2){
    return dot(v1.dir, v2.dir);
}

// calculate the length of a tangent vector
float tangNorm(Vector v){
    return sqrt(tangDot(v, v));
}

// create a unit tangent vector (in the tangle bundle)
// when possible use the normalization method below
Vector tangNormalize(Vector v){
    // length of the vector
    float length = tangNorm(v);
    return Vector(v.pos, v.dir / length);
}


// cosAng between two vector in the tangent bundle
float cosAng(Vector v1, Vector v2){
    return tangDot(v1, v2);
}

Vector turnAround(Vector v){
    return Vector(v.pos, -v.dir);
}


//reflect the unit tangent vector u off the surface with unit normal n
Vector reflectOff(Vector v, Vector n){
    return sub(scalarMult(2.0 * tangDot(v, n), n), v);
}


/*

For the next four method,
we implictely assume that we have a prefered basis f = (f_x, f_y, f_z)
at of the tangent space at the point p

The first function compute (an approximation of) the point
obtained from p by following for a time eps the pass directed a vector given in the coordinates of f

The last method takes the coordinates of a tangent vector in this basis and return the corresponding tangent vector

Here the basis at p is the image by dL of the standard basis at the origin.

*/


Point smallShift(Point p, vec3 dp) {
    // direction dp pushed at the origin in SL(2,R)
    vec4 SLdirAtOrigin = 0.5 * vec4(0, dp.z, dp.x, dp.y);
    // direction dp pushed at p.proj in SL(2,R)
    vec4 SLdirAtP =  SLtoMatrix4(p.proj) * SLdirAtOrigin;

    // fiber component of the direction pushed at p
    float den = p.proj.x * p.proj.x + p.proj.y * p.proj.y;
    float coeffX = (p.proj.x * p.proj.w - p.proj.y * p.proj.z) / den;
    float coeffY = -(p.proj.x * p.proj.z + p.proj.y * p.proj.w) / den;
    float dfiberAtP = coeffX * dp.x + coeffY * dp.y + dp.z;


    vec4 newProj = SLreduceError(p.proj + SLdirAtP);
    float newFiber = p.fiber + dfiberAtP;

    return Point(newProj, newFiber);
}

Vector createVector(Point p, vec3 dp) {
    return Vector(p, dp);
}
