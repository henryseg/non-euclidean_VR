//----------------------------------------------------------------------------------------------------------------------
//Geometry of the Models
//----------------------------------------------------------------------------------------------------------------------

//CHANGED THIS
//dot product of JUST THE HYPERBOLIC PART
 float hypDot(vec4 u,vec4 v){
     
    mat4 g = mat4(
    1.,0.,0.,0.,
    0.,1.,0.,0.,
    0.,0.,-1.,0.,
    0.,0.,0.,0.
    );

    return dot(u,g*v);  
 }

float hypNorm(vec4 v){
    return sqrt(abs(hypDot(v,v)));
}

float hypNorm(tangVector tv){
    return sqrt(abs(hypDot(tv.dir,tv.dir)));
}


vec4 hypNormalize(vec4 v){
    return v/sqrt(abs(hypDot(v,v)));
}
//project point back onto the geometry
//this is for H3, S3, H2xR, S2xR, PSL where the model of the geometry is not an affine plane in R4, but some curved subset
//numerical errors may push you off and you need to re-normalize by projecting
vec4 geomProject(vec4 v){
    return hypNormalize(v);
}


//CHANGED THIS
tangVector geomProject(tangVector tv){
//    tv.pos=hypNormalize(tv.pos);
//    tv.dir=hypNormalize(tv.dir);
    return tv;
    
}

tangVector reduceError(tangVector tv){
    return geomProject(tv);
}


//CHANGED THIS
//this function projects onto that projective model.
vec3 projPoint(vec4 p){
    return vec3(p.x/p.z, p.y/p.z, p.w);
}






//----------------------------------------------------------------------------------------------------------------------
// Spherixal Area Elements
//----------------------------------------------------------------------------------------------------------------------

//CHANGED THIS
//surface area of a sphere  of radius R
float surfArea(float rad){
    return 2.*PI*(cosh(2.*rad)-1.);
}


float areaElement(float rad, tangVector angle){
    //gives the 1/coefficient of the area element on the unit 2-sphere, after being flowed out into the space via geodesic flow
    //for isotropic geometries, this is simply the surface area of the geodesic sphere, as there's no angular dependence.
    //for non-isotropic geometries, ther's an angular dependence.
    
    return surfArea(rad);
}



//----------------------------------------------------------------------------------------------------------------------
// Distance Functions
//----------------------------------------------------------------------------------------------------------------------

//AUX FUNCTIONS

//distance between two points projections into hyperboloid:
float hypDist(vec4 u, vec4 v){
     float bUV = hypDot(u,v);
    return acosh(bUV);
}

//norm of a point in the Euclidean direction
float eucDist(vec4 u,vec4 v){
    return abs(u.w-v.w);
}




//CHANGED THIS
//in geometries where computing distance function is difficult, a cheap approximation to distance
float fakeDistance(vec4 u, vec4 v){
    // in Euclidean just use true distance cuz its cheap as can be.
    return sqrt(eucDist(u,v)*eucDist(u,v)+hypDist(u,v)*hypDist(u,v));
}

float fakeDistance(tangVector u, tangVector v){
    // overload of the previous function in case we work with tangent vectors
    return fakeDistance(u.pos, v.pos);
}

float fakeDistance(localTangVector u, localTangVector v){
    // overload of the previous function in case we work with tangent vectors
    return fakeDistance(u.pos, v.pos);
}






//CHANGED THIS
float exactDist(vec4 u, vec4 v) {
    // move p to the origin
    return sqrt(eucDist(u,v)*eucDist(u,v)+hypDist(u,v)*hypDist(u,v));
}

float exactDist(tangVector u, tangVector v){
    // overload of the previous function in case we work with tangent vectors
    return exactDist(u.pos, v.pos);
}

float exactDist(localTangVector u, localTangVector v){
    // overload of the previous function in case we work with tangent vectors
    return exactDist(u.pos, v.pos);
}



















//----------------------------------------------------------------------------------------------------------------------
// Direction Functions
//----------------------------------------------------------------------------------------------------------------------


//CHANGED THIS
tangVector tangDirection(vec4 p, vec4 q){
    // return the unit tangent to geodesic connecting p to q.
   return tangNormalize(tangVector(p, q - abs(hypDot(p,q))*p));
}

tangVector tangDirection(tangVector u, tangVector v){
    // overload of the previous function in case we work with tangent vectors
    return tangDirection(u.pos, v.pos);
}

tangVector tangDirection(localTangVector u, localTangVector v){
    // overload of the previous function in case we work with tangent vectors
    return tangDirection(u.pos, v.pos);
}







//----------------------------------------------------------------------------------------------------------------------
// Geodesic Flow
//----------------------------------------------------------------------------------------------------------------------

//CHANGED THIS
//flow along the geodesic starting at tv for a time t
tangVector geoFlow(tangVector tv, float dist){
    vec4 u=tv.pos;
    vec4 vPrime=tv.dir;

    float hypComp = hypNorm(vPrime);
    vec3 vPrimeHypPart = vPrime.xyz / hypComp;
    float hypDist = dist * hypComp; 
    float eucDist = dist * vPrime.w;
    
    vec4 resPos=vec4( u.xyz*cosh(hypDist) + vPrimeHypPart*sinh(hypDist), u.w + eucDist);
    
    vec4 resDir=vec4(hypComp* (u.xyz*sinh(hypDist) + vPrimeHypPart*cosh(hypDist)), vPrime.w);
  

    return reduceError(tangVector(resPos,resDir));
}








