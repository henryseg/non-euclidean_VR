








//NORMAL FUNCTIONS ++++++++++++++++++++++++++++++++++++++++++++++++++++
Vector surfaceNormal(Point p) {
    //float newEp = EPSILON * 10.0;
    float newEp = 0.001;

    Point shiftPX = smallShift(p, vec3(newEp, 0, 0));
    Point shiftPY = smallShift(p, vec3(0, newEp, 0));
    Point shiftPZ = smallShift(p, vec3(0, 0, newEp));
    Point shiftMX = smallShift(p, vec3(-newEp, 0, 0));
    Point shiftMY = smallShift(p, vec3(0, -newEp, 0));
    Point shiftMZ = smallShift(p, vec3(0, 0, -newEp));

    Vector n;

         n = createVector(p, vec3(
        localSceneSDF(shiftPX) - localSceneSDF(shiftMX),
        localSceneSDF(shiftPY) - localSceneSDF(shiftMY),
        localSceneSDF(shiftPZ) - localSceneSDF(shiftMZ)
        ));
        
 
    n = tangNormalize(n);
    return n;
}










//----------------------------------------------------------------------------------------------------------------------
// Color at the end of a single raymarch
//----------------------------------------------------------------------------------------------------------------------



vec3 fakeLight(vec3 baseColor,vec3 dir){
    
      toLight=Vector(sampletv.pos, dir);
    Vector fromLight=turnAround(toLight);
    
    
    //now reflect it off the surfce
    Vector reflectedRay = reflectOff(fromLight,surfNormal);
    //Calculate Diffuse Component
    float nDotL = max(cosAng(surfNormal, toLight), 0.0);
    vec3 diffuse = vec3(1.)* nDotL;
    //Calculate Specular Component
    float rDotV = max(cosAng(reflectedRay, toViewer), 0.0);
    vec3 specular = vec3(1.)* pow(rDotV,25.0);
    
    
    //Combine the above terms to compute the final color
    vec3 phongColor=(baseColor*(diffuse + .15)
                + vec3(.6, .5, .5)*specular*2.);
    
//    phongColor=pow(phongColor,vec3(1./2.2));
    return phongColor;

}





