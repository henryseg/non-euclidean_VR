//----------------------------------------------------------------------------------------------------------------------
//Geometry of the Models
//----------------------------------------------------------------------------------------------------------------------




vec4 sphNormalize(vec4 v){
    return v/sqrt(dot(v,v));
}
//project point back onto the geometry
//this is for H3, S3, H2xR, S2xR, PSL where the model of the geometry is not an affine plane in R4, but some curved subset
//numerical errors may push you off and you need to re-normalize by projecting
vec4 geomProject(vec4 v){
    return sphNormalize(v);
}


//CHANGED THIS
tangVector geomProject(tangVector tv){
    tv.pos=sphNormalize(tv.pos);
    tv.dir=sphNormalize(tv.dir);
    return tangVector(tv.pos,tv.dir);
    
}

tangVector reduceError(tangVector tv){
    return geomProject(tv);
}


//CHANGED THIS
//this function projects onto that projective model.
vec3 projPoint(vec4 p){
    return vec3(p.x/p.w, p.y/p.w, p.z/p.w);
}






//----------------------------------------------------------------------------------------------------------------------
// Spherixal Area Elements
//----------------------------------------------------------------------------------------------------------------------

//CHANGED THIS
//surface area of a sphere  of radius R
float surfArea(float rad){
    return 2.*PI*(1.-cos(2.*rad));
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

//CHANGED THIS
//in geometries where computing distance function is difficult, a cheap approximation to distance
float fakeDistance(vec4 p, vec4 q){
    // in Euclidean just use true distance cuz its cheap as can be.
    return acos(dot(p,q));
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
float exactDist(vec4 p, vec4 q) {
    // move p to the origin
    return acos(dot(p,q));
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
   return tangNormalize(tangVector(p, q - dot(p,q)*p));
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
tangVector geoFlow(tangVector tv, float t){
    // follow the geodesic flow during a time t
    vec4 resPos=tv.pos*cos(t) + tv.dir*sin(t);
    //tangent is derivative of position
    vec4 resDir=-tv.pos*sin(t) + tv.dir*cos(t);
    
    return tangVector(resPos,resDir);
}


//
//localTangVector geoFlow(localTangVector tv, float t) {
//    //overload of previous function for dealing with local tangent vectors
//    
//}








//----------------------------------------------------------------------------------------------------------------------
// TANG BASIS
//----------------------------------------------------------------------------------------------------------------------



//CHANGED THIS
//MOVED THIS DOWN TO GLOBAL GEOMETRY TO USE TANGDIRECTION
//basis for the tangent space at a point
mat4 tangBasis(vec4 p){
    float dist=acos(p.w);
    vec4 direction = tangDirection(ORIGIN,p).dir;
    return translateByVector(dist*direction).matrix;
}
