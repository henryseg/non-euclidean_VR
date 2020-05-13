//----------------------------------------------------------------------------------------------------------------------
// DECIDING MATERIALS IN THE RAYMARCH
//----------------------------------------------------------------------------------------------------------------------

//
////do the raymarch, then depending on what you hit figure out the color:
//vec4 marchedColor(int hitWhich, Isometry totalFixMatrix, tangVector sampletv){
//
//    
//     //Based on hitWhich decide whether we hit a global object, local object, or nothing
//    if (hitWhich == 0){ //Didn't hit anything ------------------------
//        //COLOR THE FRAME DARK GRAY
//        //0.2 is medium gray, 0 is black
//        return vec4(0.1);
//    }
//    else if (hitWhich == 1){
//        // lights
//        vec3 pixelColor= lightColor(totalFixMatrix, sampletv, colorOfLight);
//        return vec4(pixelColor, 1.0);
//    }
//    else if (hitWhich == 5){
//        //debug
//        return vec4(debugColor, 1.0);
//    }
//    else if (hitWhich == 2){
//        // global object
//        vec3 pixelColor= ballColor(totalFixMatrix, sampletv);
//        return vec4(pixelColor, 1.0);
//
//    }
//    else if (hitWhich ==3) {
//        // local objects
//        //vec3 pixelColor=vec3(20.*distToViewer/MAX_DIST,0.,0.);
//        vec3 pixelColor= tilingColor(totalFixMatrix, sampletv);
//        return vec4(pixelColor, 1.0);
//
//    }
//
//    
//}
//
//
//// Deciding when a material is mirrored or not
//bool isMirrored(int hitWhich){
//       
//     //Based on hitWhich decide whether we hit a global object, local object, or nothing
//    if (hitWhich == 0){ //Didn't hit anything ------------------------
//        return false;
//    }
//    else if (hitWhich == 1){
//        // lights
//        return false;
//    }
//    else if (hitWhich == 5){
//        //debug
//        return false;
//    }
//    else if (hitWhich == 2){
//        // global object
//        return true;
//
//    }
//    else if (hitWhich ==3) {
//        // local objects
//        return true;
//    }
//}
//
//
//
//
//
//










vec3  getTheColor(tangVector rayDir, Isometry  totalFixMatrix){
    
    //these get reused over and over  to compute the contributions from each light
    vec3 phong;
    float shadow;
    float emitDistToViewer;
    
    vec3 origColor;//color of the surface where it is struck
    
    vec3 emitLocalColor=vec3(0.);//the total lighting  computation from local lights
    vec3 emitGlobalColor=vec3(0.);//the total lighting  computation from global lights
    vec3 emitColor;// the  total lighting computation from all sources
    
    vec3 reflLocalColor=vec3(0.);//the total lighting  computation from local lights
    vec3 reflGlobalColor=vec3(0.);//the total lighting  computation from global lights
    vec3 reflColor;//the total lighting from all sources at the reflected point
    
    vec3 finalColor; //the final color, combining reflection and first march

  
    //do the  raymarch    
    raymarch(rayDir, totalFixMatrix);
    
    if (hitWhich == 0){ //Didn't hit anything ------------------------
        //COLOR THE FRAME DARK GRAY
        //0.2 is medium gray, 0 is black
        return vec3(0.1);
    }
    else if (hitWhich == 1){
        // lights
        origColor=colorOfLight;
    }
    
    else if (hitWhich ==3) {
    origColor=vec3(0.1,0.2,0.3);//just some random blue color
    }
    
    
    
    
    
    
    
    
    
    
    //Got the original color.  Now lets get the  correct phong shading
    
    //this is stuff we  can compute once and use for every light source
    vec4 surfacePosition=sampletv.pos;//position on the surface of the sample point
    tangVector toViewer=turnAround(sampletv);//tangent vector on surface pointing to viewer
    tangVector surfNormal=surfaceNormal(sampletv);//normal vector to surface
   
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    //first we do the local light.  Get its position and set it to "light position"
    vec4 lightPosition=localLightPos;
    vec3 lightColor=localLightColor;
    
    
    //now compute these  two useful  quantites out of it
    tangVector toLight=tangDirection(surfacePosition, lightPosition);//tangent vector on surface pointing to light
    float distToLight=exactDist(surfacePosition, lightPosition);//distance from sample point to light source
    
    //this is all the info we need to get Phong for this light source
    phong=phongShading(toLight,toViewer,surfNormal,distToLight,origColor,lightColor,4.+4.*brightness*brightness);
    
    //now for this same light source, we compute the shadow
    //IMPORTANT NOTE the original local light source almost never producesany shadows: from the local scene:
    //its in the middle of a convex fundamental domain, so every point is in view
    shadow=shadowMarch(toLight,distToLight);
    emitLocalColor=shadow*phong;//right now this is the only contribution to this color.

    
    //because its a local light, we need to account for light from its neighbors as well:
//    //this is not a good fix for local lighting - as there may be more than six neighbor cubes (ie near the vertices)
    for (int i=0; i<6; i++){
        lightPosition=invGenerators[i]*localLightPos;
        
        toLight=tangDirection(surfacePosition,lightPosition);//tangent vector on surface pointing to light
        distToLight=exactDist(surfacePosition, lightPosition);//distance from sample point to light source
        phong=phongShading(toLight,toViewer,surfNormal,distToLight,origColor,lightColor,4.+4.*brightness*brightness);
        shadow=shadowMarch(toLight,distToLight);
        emitLocalColor+=shadow*phong;
   }
    
    //renormalize the emitted color by dividing by the nubmer of total light sources which have contributed.
    emitLocalColor=emitLocalColor/7.;
    
    
    
    
    
    
    
    
    //now, do the same thing for the GLOBAL LIGHTS! Yikes this is a lot of raymarching...
        for (int i=0; i<4; i++){
        
        Isometry totalIsom=composeIsometry(totalFixMatrix, invCellBoost);
        lightPosition=translate(totalIsom,lightPositions[i]);
            
        toLight=tangDirection(surfacePosition,lightPosition);//tangent vector on surface pointing to light
        distToLight=exactDist(surfacePosition, lightPosition);//distance from sample point to light source
        phong=phongShading(toLight,toViewer,surfNormal,distToLight,origColor,lightIntensities[i].xyz,4.+4.*brightness*brightness);
        shadow=shadowMarch(toLight,distToLight);
        emitGlobalColor+=shadow*phong;
   }
    
    
    //normalize the emit color
    emitColor=(emitLocalColor+2.*emitGlobalColor)/3.;
    
    //add fog to the emitted color
    
    emitColor=fog(emitColor, vec3(0.02,0.02,0.02), distToViewer);
    
    //also need to save this  distance, as we need to apply this fog to mixing the reflected color again
    emitDistToViewer=distToViewer;
    
    
    
    
    
    
    
    // OK! DONE WITH LIGHTING FOR THE FIRST PASS!
    //now - time for....reflections!
    
        //this means...we do the raymarch again! starting from this position (sampletv)
    //first, reflect this direction wtih respect to the surface normal
    tangVector newDir = reflectOff(sampletv, surfNormal);
    //move the new ray off a little bit
    newDir=geoFlow(newDir,0.01);
    //then, raymarch in this new direction
    raymarch(newDir, totalFixMatrix);
    
    //now we are basically back where we started with the lighting computations
    //so its time to do them again!
    //(except we won't have  our shadows have shadows....thats just too extra)
    
    //figure out what we  hit  when hitWhich was triggered
     if (hitWhich == 0){ //Didn't hit anything ------------------------
        //COLOR THE FRAME DARK GRAY
        //0.2 is medium gray, 0 is black
        return vec3(0.1);
    }
    else if (hitWhich == 1){
        // lights
        origColor=colorOfLight;
    }
    
    else if (hitWhich ==3) {
    origColor=vec3(0.1,0.2,0.3);//just some random blue color
    }
    
    
    //Got the original color.  Now lets get the  correct phong shading
    
    //this is stuff we  can compute once and use for every light source
    surfacePosition=sampletv.pos;//position on the surface of the sample point
    toViewer=turnAround(sampletv);//tangent vector on surface pointing to viewer
    surfNormal=surfaceNormal(sampletv);//normal vector to surface
   
    
    
    //first we do the local light.  Get its position and set it to "light position"
    lightPosition=localLightPos;
    lightColor=localLightColor;
    
    
    //now compute these  two useful  quantites out of it
    toLight=tangDirection(surfacePosition, lightPosition);//tangent vector on surface pointing to light
    distToLight=exactDist(surfacePosition, lightPosition);//distance from sample point to light source
    
    //this is all the info we need to get Phong for this light source
    phong=phongShading(toLight,toViewer,surfNormal,distToLight,origColor,lightColor,4.+4.*brightness*brightness);
    
    //no shadow raymarches here!
    reflLocalColor=phong;//right now this is the only contribution to this color.

    
    //because its a local light, we need to account for light from its neighbors as well:
//    //this is not a good fix for local lighting - as there may be more than six neighbor cubes (ie near the vertices)
    for (int i=0; i<6; i++){
        lightPosition=invGenerators[i]*localLightPos;
        
        toLight=tangDirection(surfacePosition,lightPosition);//tangent vector on surface pointing to light
        distToLight=exactDist(surfacePosition, lightPosition);//distance from sample point to light source
        phong=phongShading(toLight,toViewer,surfNormal,distToLight,origColor,lightColor,4.+4.*brightness*brightness);
        //again, no shadows; otherwise this is the  same as before.
        reflLocalColor+=phong;
   }
    
    //renormalize the emitted color by dividing by the nubmer of total light sources which have contributed.
    reflLocalColor=reflLocalColor/7.;
    
    
    
    
    
    
    
    
    //now, do the same thing for the GLOBAL LIGHTS! Yikes this is a lot of raymarching...
        for (int i=0; i<4; i++){
        
        Isometry totalIsom=composeIsometry(totalFixMatrix, invCellBoost);
        lightPosition=translate(totalIsom,lightPositions[i]);
            
        toLight=tangDirection(surfacePosition,lightPosition);//tangent vector on surface pointing to light
        distToLight=exactDist(surfacePosition, lightPosition);//distance from sample point to light source
        phong=phongShading(toLight,toViewer,surfNormal,distToLight,origColor,lightIntensities[i].xyz,4.+4.*brightness*brightness);
        //no shadow
        reflGlobalColor+=phong;
   }
    
    //NOTE: for some reason this reflection right now is causing problems
    //it seems to have to do with  cell bost, when you change cells the reflection of thee global lights changes
    //but - the original global lighting does not, just the reflected part.
    //strange...
    
    //normalize the reflect color
    //WANT TO INCLUDE THE GLOBAL LIGHT REFLECTIONS HERE BUT THERES STILL A SLIGHT ERROR!
    reflColor=reflLocalColor;
    
    //add in fog in the reflection (so far away reflected items are blurry)
    reflColor=fog(reflColor,vec3(0.02,0.02,0.02),distToViewer);
    
    //add in fog from the original distance!
    reflColor=fog(reflColor,vec3(0.02,0.02,0.02),emitDistToViewer);
    
    //build the total color
    //uniform mirror dictates how reflective the  surface is
    finalColor=(1.-mirror)*emitColor+mirror*reflColor;
    
    
    return finalColor;
    
    //BUT not done yet! Still have fog to add!
    
   
}
    
    
    
    
    
    
    
    
    
    
    
    //---------DOING ONE REFLECTION ----------------------
//    
//    else{
//    
//    //this means...we do the raymarch again! starting from this position (sampletv)
//    //first, reflect this direction wtih respect to the surface normal
//    tangVector nVec=surfaceNormal(sampletv);
//    tangVector newDir = reflectOff(sampletv, nVec);
//    
//    //randomly adjust the direction by a TINY ammount to simulate slight  roughness in the surface
////    float n = sin(dot(newDir.pos, vec4(27, 113, 57,0.)));
////    vec4 rnd = fract(vec4(2097152, 262144, 32768,0.)*n)*.16 - .08;
////    newDir.dir=newDir.dir+0.05*rnd;
//    
//    //move the new ray off a little bit
//    newDir=geoFlow(newDir,0.01);
//    //then, raymarch in this new direction
//    reflectmarch(newDir, totalFixMatrix);
//        
//    //now, get the reflected color
//    reflectedColor=marchedColor(hitWhich,totalFixMatrix,sampletv);
//    
//    //and then combine the first pass color and the  reflected color to output
//    resultingColor= ((1.-mirror)*resultingColor+mirror*reflectedColor);
//    //should stop here!    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
        







