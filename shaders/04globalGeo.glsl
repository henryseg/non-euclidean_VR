//----------------------------------------------------------------------------------------------------------------------
//Geometry of the Models
//----------------------------------------------------------------------------------------------------------------------


//project point back onto the geometry
//this is for H3, S3, H2xR, S2xR, PSL where the model of the geometry is not an affine plane in R4, but some curved subset
//numerical errors may push you off and you need to re-normalize by projecting
vec4 geomProject(vec4 p){
    return p;
}

//at times it is useful to use the Klein model or KleinxR for H3, H2xR and similarly 
//the Gnonomic projection or GnomonicxR for S3, S2xR geometry calculations.
//this function projects onto that projective model.
vec4 modelProject(vec4 p){
    return p;
}





//----------------------------------------------------------------------------------------------------------------------
// Distance Functions
//----------------------------------------------------------------------------------------------------------------------

//surface area of a sphere  of radius R
float surfArea(float rad){
    return 4.*PI*rad*rad;
}

//in geometries where computing distance function is difficult, a cheap approximation to distance
float fakeDistance(vec4 p, vec4 q){
    // in Euclidean just use true distance cuz its cheap as can be.
    return length(q-p);
}

float fakeDistance(tangVector u, tangVector v){
    // overload of the previous function in case we work with tangent vectors
    return fakeDistance(u.pos, v.pos);
}

float fakeDistance(localTangVector u, localTangVector v){
    // overload of the previous function in case we work with tangent vectors
    return fakeDistance(u.pos, v.pos);
}







float exactDist(vec4 p, vec4 q) {
    // move p to the origin
    return length(q-p);
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



tangVector tangDirection(vec4 p, vec4 q){
    // return the unit tangent to geodesic connecting p to q.
    return tangNormalize(tangVector(p, q - p));
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



tangVector geoFlow(tangVector tv, float t) {
    //geodesic flow on the tangent bundle
    return tangVector(tv.pos + t * tv.dir, tv.dir);
}


localTangVector geoFlow(localTangVector tv, float t) {
    //overload of previous function for dealing with local tangent vectors
    return localTangVector(tv.pos + t * tv.dir, tv.dir);
}