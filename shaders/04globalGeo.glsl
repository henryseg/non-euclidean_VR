//----------------------------------------------------------------------------------------------------------------------
//Geometry of the Models
//----------------------------------------------------------------------------------------------------------------------

//CHANGED THIS
 float hypDot(vec4 u,vec4 v){
return tangDot(hypPart(u),hypPart(v));
 }

float hypNorm(vec4 p){
    vec4 q=hypPart(p);
    return tangNorm(q);
}


//project POINT back onto the geometry
//this is for H3, S3, H2xR, S2xR, PSL where the model of the geometry is not an affine plane in R4, but some curved subset
//numerical errors may push you off and you need to re-normalize by projecting
vec4 geomProject(vec4 p){
    float t=p.w;
    return hypPart(p)/hypNorm(p)+vec4(0.,0.,0.,t);
}


//project a tangent vector back onto the tangent space
vec4 tangProject(vec4 v){
  return vecNormalize(v);//just replace it with the unit vector in the same direction?  or should we do somethign else here? 
}


//CHANGED THIS
tangVector geomProject(tangVector tv){
  tv.pos=geomProject(tv.pos);
  tv.dir=tangProject(tv.dir);
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
    return 2.*PI*(cosh(rad));
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
float hypDist(vec4 p, vec4 q){
     float d= hypDot(p,q);
    return acosh(abs(d));
}

//norm of a point in the Euclidean direction
float eucDist(vec4 p,vec4 q){
    return abs(p.w-q.w);
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
float exactDist(vec4 p, vec4 q) {
    // move p to the origin
    return sqrt(eucDist(p,q)*eucDist(p,q)+hypDist(p,q)*hypDist(p,q));
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
    //hypDot is negative on the space, positive on tang space...
    vec3 hypPart = q.xyz - abs(hypDot(p,q))*p.xyz;
    float RPart = q.w-p.w;
    vec4 diff=vec4(hypPart,RPart);
    // return the unit tangent to geodesic connecting p to q.
   return tangNormalize(tangVector(p,diff));
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
    vec4 p=tv.pos;
    vec4 v=tv.dir;
    
    float lHyp=hypNorm(v);//length of hyperbolic component
    vec4 vHyp=hypPart(v)/lHyp;//unit hyperbolic component
    
    //do the hyperbolic flow
    vec4 hypFlowP=hypPart(p)*cosh(dist*lHyp)+vHyp*sinh(dist*lHyp);
    vec4 hypFlowV=hypPart(p)*sinh(dist*lHyp)*lHyp+vHyp*cosh(dist*lHyp)*lHyp;
    
    vec4 vEuc=vec4(0.,0.,0.,v.w);
    //do the Euclidean flow
    vec4 eucFlowP=eucPart(p)+dist*vEuc;
    vec4 eucFlowV=vEuc;   

    vec4 resPos=hypFlowP+eucFlowP;
    vec4 resDir=hypFlowV+eucFlowV;
    
    return reduceError(tangVector(resPos,resDir));

}








