

#version 300 es
out vec4 out_FragColor;

//Code at the start of the shader






















//----------------------------------------------------------------------------------------------------------------------
// STRUCT isometry
//----------------------------------------------------------------------------------------------------------------------

/*
  Data type for manipulating isometries of the space
  An Isometry is given by
  - matrix : a 4x4 matrix
*/


//CHANGED THIS
struct Isometry {
    mat4 matrix;
    vec4 real;// isometry of the space
};


//CHANGED THIS
Isometry composeIsometry(Isometry A, Isometry B)
{
    return Isometry(A.matrix*B.matrix,A.real+B.real);
}



//CHANGED THIS
Isometry translateByVector(vec4 v){
    vec4 realPart=vec4(0,0,0,v.z);
    mat4 matrixPart=mat4(1.);
    float len=sqrt(v.x*v.x+v.y*v.y);
    float c1= sin(len);
    float c2=1.-cos(len);
    if(len!=0.){
     float dx=v.x/len;
     float dy=v.y/len;
    
     mat4 m=mat4(
        0, 0, -dx, 0,
        0, 0, -dy, 0,
        dx, dy, 0, 0,
        0, 0, 0, 0
     );
    matrixPart=matrixPart+c1* m+c2*m*m;
    }
    Isometry result =Isometry(matrixPart,realPart);
    return result;
}








//CHANGED THIS
Isometry makeLeftTranslation(vec4 p) {

    return translateByVector(p);
}


//CHANGED THIS
Isometry makeInvLeftTranslation(vec4 p) {

    return translateByVector(-p);
}

//CHANGED THIS
vec4 translate(Isometry A, vec4 v) {
    // translate a point of a vector by the given direction
    return (A.matrix * v)+A.real;
}


//CHANGED THIS
Isometry getInverse(Isometry A){
mat4 B=inverse(A.matrix);
vec4 w=-A.real;
    return Isometry(B,w);
}

















//----------------------------------------------------------------------------------------------------------------------
// STRUCT tangVector
//----------------------------------------------------------------------------------------------------------------------

/*
  Data type for manipulating points in the tangent bundle
  A tangVector is given by
  - pos : a point in the space
  - dir: a tangent vector at pos

  Implement various basic methods to manipulate them
*/

struct tangVector {
    vec4 pos;// position on the manifold
    vec4 dir;// vector in the tangent space at the point pos
};


//----------------------------------------------------------------------------------------------------------------------
// Applying Isometries, Facings
//----------------------------------------------------------------------------------------------------------------------


//these commands don't really make sense with makeLeftTranslation defined as before...
//Isometry makeLeftTranslation(tangVector v) {
//    // overlaod using tangVector
//    return makeLeftTranslation(v.pos);
//}
//
//
//Isometry makeInvLeftTranslation(tangVector v) {
//    // overlaod using tangVector
//    return makeInvLeftTranslation(v.pos);
//}

//CHANGED THIS
tangVector translate(Isometry A, tangVector v) {
    // over load to translate a direction
    return tangVector((A.matrix * v.pos)+A.real, A.matrix * v.dir);
}







tangVector turnAround(tangVector v){
    return tangVector(v.pos, -v.dir);
}


//----------------------------------------------------------------------------------------------------------------------
// STRUCT localTangVector
//----------------------------------------------------------------------------------------------------------------------

/*
  Another data type for manipulating points in the tangent bundler
  A localTangVector is given by
  - pos : a point in the space
  - dir: the pull back of the tangent vector by the (unique) element of Sol bringing pos to the origin

  This sould reduce numerical errors.

  Implement various basic methods to manipulate them
*/

struct localTangVector {
    vec4 pos;// position on the manifold
    vec4 dir;// pulled back tangent vector
};


//----------------------------------------------------------------------------------------------------------------------
// Applying Isometries, Facings
//----------------------------------------------------------------------------------------------------------------------
//
//Isometry makeLeftTranslation(localTangVector v) {
//    // overlaod using tangVector
//    return makeLeftTranslation(v.pos);
//}
//
//
//Isometry makeInvLeftTranslation(localTangVector v) {
//    // overlaod using tangVector
//    return makeInvLeftTranslation(v.pos);
//}
//
//
//localTangVector translate(Isometry A, localTangVector v) {
//    // over load to translate a direction
//    // WARNING. Only works if A is an element of SOL.
//    // Any more general isometry should also acts on the direction component
//    return localTangVector(A.matrix * v.pos+A.real, v.dir);
//}
//
//
//localTangVector rotateFacing(mat4 A, localTangVector v){
//    // apply an isometry to the tangent vector (both the point and the direction)
//    return localTangVector(v.pos, A*v.dir);
//}
//
//localTangVector turnAround(localTangVector v){
//    return localTangVector(v.pos, -v.dir);
//}
//
//














