//----------------------------------------------------------------------------------------------------------------------
//Geometry of the Models
//----------------------------------------------------------------------------------------------------------------------

//CHANGED THIS
 float sphDot(vec4 u,vec4 v){
return tangDot(sphPart(u),sphPart(v));
 }

float sphNorm(vec4 p){
    vec4 q=sphPart(p);
    return tangNorm(q);
}


//project POINT back onto the geometry
//this is for H3, S3, H2xR, S2xR, PSL where the model of the geometry is not an affine plane in R4, but some curved subset
//numerical errors may push you off and you need to re-normalize by projecting
vec4 geomProject(vec4 p){
    float t=p.w;
    return sphPart(p)/sphNorm(p)+vec4(0.,0.,0.,t);
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
//float surfArea(float rad){
//    return 2.*PI*cos(rad)*cos(rad)+0.2;
//}
//


//generalized sine curve of curvature k
float genSin(float k, float r){
    if(k<0.){//hpyerbolic trig
        return sinh(r*sqrt(abs(k)))/sqrt(abs(k));
    }
    else{//then k>0, so spherical trig
        return sin(r*sqrt(abs(k)))/sqrt(abs(k));
    }
}





float areaElement(float rad, tangVector angle){
    
    float cosphi=angle.dir.w;
    float sin2phi=1.01-cosphi*cosphi;
    
    return abs(rad*genSin(sin2phi,rad));
}


//float areaElement(float rad, tangVector angle){
//    //gives the 1/coefficient of the area element on the unit 2-sphere, after being flowed out into the space via geodesic flow
//    //for isotropic geometries, this is simply the surface area of the geodesic sphere, as there's no angular dependence.
//    //for non-isotropic geometries, ther's an angular dependence.
//    float cosphi=angle.dir.w;
//    
//    
//    //expansion when close to z axis
//    if(abs(cosphi)>0.98){
//        return rad*(rad-rad*rad*rad*(1.-cosphi*cosphi)/6.);
//    }
//else{
//    float sinphi=sqrt(1.-cosphi*cosphi);
//    return rad*sin(rad*sinphi)/(sinphi);
//    //the 0.2 is to fix numerical errrors of dividing by zero in places...
//    
//}
//}

//----------------------------------------------------------------------------------------------------------------------
// Distance Functions
//----------------------------------------------------------------------------------------------------------------------

//AUX FUNCTIONS

//distance between two points projections into hyperboloid:
float sphDist(vec4 p, vec4 q){
     float d= sphDot(p,q);
    return acos(d);
}

//norm of a point in the Euclidean direction
float eucDist(vec4 p,vec4 q){
    return abs(p.w-q.w);
}




//CHANGED THIS
//in geometries where computing distance function is difficult, a cheap approximation to distance
float fakeDistance(vec4 u, vec4 v){
    // in Euclidean just use true distance cuz its cheap as can be.
    return sqrt(eucDist(u,v)*eucDist(u,v)+sphDist(u,v)*sphDist(u,v));
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
    return sqrt(eucDist(p,q)*eucDist(p,q)+sphDist(p,q)*sphDist(p,q));
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



////CHANGED THIS
////this returns the shortest geodesic
tangVector tangDirection(vec4 p, vec4 q){
    //hypDot is negative on the space, positive on tang space...
    vec3 sphPartDir = normalize(q.xyz - sphDot(p,q)*p.xyz);
    vec3 sphPart =sphDist(p,q)*sphPartDir;
    float RPart = q.w-p.w;
    vec4 diff=vec4(sphPart,RPart);
    // return the unit tangent to geodesic connecting p to q.
   return tangNormalize(tangVector(p,diff));
}



//
//
//
////CHANGED THIS
//tangVector tangDirection(vec4 p, vec4 q){
//    //hypDot is negative on the space, positive on tang space...
//    vec3 sphPart = q.xyz - sphDot(p,q)*p.xyz;
//    float RPart = q.w-p.w;
//    vec4 diff=vec4(sphPart,RPart);
//    // return the unit tangent to geodesic connecting p to q.
//   return tangNormalize(tangVector(p,diff));
//}
//


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
    
    float lSph=sphNorm(v);//length of hyperbolic component
    vec4 vSph=sphPart(v)/lSph;//unit hyperbolic component
    
    //do the hyperbolic flow
    vec4 sphFlowP=sphPart(p)*cos(dist*lSph)+vSph*sin(dist*lSph);
    vec4 sphFlowV=-sphPart(p)*sin(dist*lSph)*lSph+vSph*cos(dist*lSph)*lSph;
    
    vec4 vEuc=vec4(0.,0.,0.,v.w);
    //do the Euclidean flow
    vec4 eucFlowP=eucPart(p)+dist*vEuc;
    vec4 eucFlowV=vEuc;   

    vec4 resPos=sphFlowP+eucFlowP;
    vec4 resDir=sphFlowV+eucFlowV;
    
    return reduceError(tangVector(resPos,resDir));

}








