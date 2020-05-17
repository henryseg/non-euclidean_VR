//----------------------------------------------------------------------------------------------------------------------
// Spheres, Ellipsoids
//----------------------------------------------------------------------------------------------------------------------


float sphereSDF(vec4 p, vec4 center, float radius){
    return exactDist(p, center) - radius;
}





//----------------------------------------------------------------------------------------------------------------------
// Half Spaces, Slices
//----------------------------------------------------------------------------------------------------------------------


float horizontalHalfSpaceSDF(vec4 p, float h) {
    //signed distance function to the half space z < h
    return p.z - h;
}


float sliceSDF(vec4 p) {
    float HS1= 0.;
    HS1=horizontalHalfSpaceSDF(p, -0.1);
    float HS2=0.;
    HS2=-horizontalHalfSpaceSDF(p, -1.);
    return max(HS1, HS2);
}



//----------------------------------------------------------------------------------------------------------------------
// Cylinders
//----------------------------------------------------------------------------------------------------------------------

float cylSDF(vec4 p, float r){
    //cylinder about z-axis of radius r.
    return sphereSDF(vec4(p.x, p.y, 0., 1.), ORIGIN, r);
}









//----------------------------------------------------------------------------------------------------------------------
// Fake Distances to Objects
//----------------------------------------------------------------------------------------------------------------------


float ellipsoidSDF(vec4 p, vec4 center, float radius){
    //distance functions for these ellipsoids; modeled as affine squished spheres.
    return exactDist(vec4(p.x, p.y, p.z/2., 1.), center) - radius;
}



float fatEllipsoidSDF(vec4 p, vec4 center, float radius){
    //distance function applying affine transformation to a sphere.
    return exactDist(vec4(p.x/10., p.y/10., p.z, 1.), center) - radius;
}







