
//----------------------------------------------------------------------------------------------------------------------
// Smooth Union and Intersection: smoothmin and max
//----------------------------------------------------------------------------------------------------------------------


//Designed by IQ to make quick smooth minima
//found at http://www.viniciusgraciano.com/blog/smin/

// Polynomial smooth minimum by iq
float smin(float a, float b, float k) {
  float h = clamp(0.5 + 0.5*(a-b)/k, 0.0, 1.0);
  return mix(a, b, h) - k*h*(1.0-h);
}

float smax(float a, float b, float k) {
  return -smin(-a,-b,k);
}








//----------------------------------------------------------------------------------------------------------------------
// Old commands from building a local scene; probably to be deleted.
//----------------------------------------------------------------------------------------------------------------------

//float centerSDF(vec4 p, vec4 center, float radius){
//    return sphereSDF(p, center, radius);
//}
//
////sphere at the vertices of an origin centered cube
//float vertexSDF(vec4 p, vec4 cornerPoint, float size){
//    return sphereSDF(abs(p), cornerPoint, size);
//}

