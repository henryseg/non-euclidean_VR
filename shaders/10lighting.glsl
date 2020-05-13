//----------------------------------------------------------------------------------------------------------------------
// Light Attenuation with  Distance
//----------------------------------------------------------------------------------------------------------------------
//light intensity as a fn of distance
float lightAtt(float dist){
    if (FAKE_LIGHT_FALLOFF){
        //fake falloff
        return 0.1+0.5*dist;
    }
    //actual distance function
    return 0.1+surfArea(dist);
}





//----------------------------------------------------------------------------------------------------------------------
// Getting  a Surface Normal
//----------------------------------------------------------------------------------------------------------------------

//NORMAL FUNCTIONS ++++++++++++++++++++++++++++++++++++++++++++++++++++
//Given a point in the scene where you stop raymarching as you have hit a surface, find the normal at that point
tangVector surfaceNormal(vec4 p) { 
    float newEp = EPSILON * 10.0;
    //basis for the tangent space at that point.
    mat4 theBasis= tangBasis(p);
    vec4 basis_x = theBasis[0];
    vec4 basis_y = theBasis[1];
    vec4 basis_z = theBasis[2];
    
    if (isLocal==0){ //global scene
        //p+EPSILON * basis_x should be lorentz normalized however it is close enough to be good enough
        tangVector tv = tangVector(p,
        basis_x * (globalSceneSDF(p + newEp*basis_x) - globalSceneSDF(p - newEp*basis_x)) +
        basis_y * (globalSceneSDF(p + newEp*basis_y) - globalSceneSDF(p - newEp*basis_y)) +
        basis_z * (globalSceneSDF(p + newEp*basis_z) - globalSceneSDF(p - newEp*basis_z))
        );
        return tangNormalize(tv);

    }
    else { //local scene
        tangVector tv = tangVector(p,
        basis_x * (localSceneSDF(p + newEp*basis_x) - localSceneSDF(p - newEp*basis_x)) +
        basis_y * (localSceneSDF(p + newEp*basis_y) - localSceneSDF(p - newEp*basis_y)) +
        basis_z * (localSceneSDF(p + newEp*basis_z) - localSceneSDF(p - newEp*basis_z))
        );
        return tangNormalize(tv);
    }
}

//overload of the above to work being given a tangent vector
tangVector surfaceNormal(tangVector u){
    return surfaceNormal(u.pos);
}








//----------------------------------------------------------------------------------------------------------------------
// Specularity and Diffusivity of Surfaces
//----------------------------------------------------------------------------------------------------------------------
//toLight and toViewer are tangent vectors at sample point, pointed at the light source and viewer respectively
vec3 phongShading(tangVector toLight, tangVector toViewer, tangVector  surfNormal, float distToLight, vec3 baseColor, vec3 lightColor, float lightIntensity){
    //Calculations - Phong Reflection Model

    //this is tangent vector to the incomming light ray
    tangVector fromLight=turnAround(toLight);
    //now reflect it off the surfce
    tangVector reflectedRay = reflectOff(fromLight,surfNormal);
    //Calculate Diffuse Component
    float nDotL = max(cosAng(surfNormal, toLight), 0.0);
    vec3 diffuse = lightColor.rgb * nDotL;
    //Calculate Specular Component
    float rDotV = max(cosAng(reflectedRay, toViewer), 0.0);
    vec3 specular = lightColor.rgb * pow(rDotV,20.0);
    //Attenuation - of the light intensity due to distance from source
    float att = lightIntensity /lightAtt(distToLight);
    //Combine the above terms to compute the final color
    return (baseColor*(diffuse + .15) + vec3(.6, .5, .5)*specular*2.) * att;
   //return att*((diffuse*baseColor) + specular);
}



//----------------------------------------------------------------------------------------------------------------------
// Shadows
//----------------------------------------------------------------------------------------------------------------------

//these are done with a raymarcher in raymarch






//----------------------------------------------------------------------------------------------------------------------
// Fog
//----------------------------------------------------------------------------------------------------------------------


//right now super basic fog: just a smooth step function of distance blacking out at max distance.
vec3 fog(vec3 color, vec3 fogColor, float distToViewer){
    float fogDensity=smoothstep(0., MAX_DIST/20., distToViewer);
    return mix(color, fogColor, fogDensity); 
}

























//----------------------------------------------------------------------------------------------------------------------
// DOING ALL THE LIGHTING  CALCULATIONS
//----------------------------------------------------------------------------------------------------------------------

//these are to be used inside of a larger environment where  we have already defined the local behavior at  the surface which does not strictly depend on this particular light.
//in particular, we have access to vector toViewer, surfNormal
//
//vec3 lightingContribution(tangVector toViewer, tangVector surfNormal, vec4 lightPosition, vec3 baseColor,vec4 lightColor){
//    
//    vec3 color;
//    float shade;// a number between 0 and 1 representing proportion of shadow
//    vec3 phong;// the phong  model  addition to base color
//    
//    vec4 surfacePosition=sampletv.pos;//position on the surface of the sample point
//    tangVector toViewer=turnAround(sampletv);//tangent vector on surface pointing to viewer
//    tangVector toLight=tangDirection(surfacePosition, lightPosition);//tangent vector on surface pointing to light
//    float distToLight=exactDist(surfacePosition, lightPosition);//distance from sample point to light source
//    
//    phong=phongShading(toLight,toViewer,distToLight,baseColor,lightColor,2.);
//    
//    color=phong;
//    return color;
//}
//
//
//
//vec3 lightingShadowContribution(vec4 lightPosition, vec3 baseColor, vec4 lightColor){
//    
//    vec3 color;
//    float shade;// a number between 0 and 1 representing proportion of shadow
//    vec3 phong;// the phong  model  addition to base color
//    
//    vec4 surfacePosition=sampletv.pos;//position on the surface of the sample point
//    tangVector toViewer=turnAround(sampletv);//tangent vector on surface pointing to viewer
//    tangVector toLight=tangDirection(surfacePosition, lightPosition);//tangent vector on surface pointing to light
//    float distToLight=exactDist(surfacePosition, lightPosition);//distance from sample point to light source
//    
//    phong=phongShading(toLight,toViewer,distToLight,baseColor,lightColor,2.);
//    shade=shadowMarch(toLight,distToLight);
//    
//    color=shade*phong;
//    return color;
//}
//
//
//
//










//
//
//
//
//vec3 lightingCalculations(Isometry totalFixMatrix, vec3 color){
//    
//    //set here to be the input color, whitened a bit
//    vec3 surfColor=0.1*vec3(1.)+0.9*color;
//    
//    //sample point on the surface
//    vec4 SP = sampletv.pos;
//    vec4 TLP;//translated light position
//    //tangent vector at sample point pointing back at viewer
//    tangVector toViewer = turnAround(sampletv);
//
//    //intrinsic color of the surface
//    //vec3 surfColor=color;
//
//    
//    tangVector toLight;
//    float distToLight;
//
//    //--------------------------------------------------
//    //Lighting Calculations
//    //--------------------------------------------------
//
//    
//    float shade=1.;
//    vec3 phong=vec3(1.);
//    
//    //GLOBAL LIGHTS
//    //right now only drawing one light
//    for (int i = 0; i<4; i++){
//        //for each global light, translate its position via fixMatrix and cellBost
//        Isometry totalIsom=composeIsometry(totalFixMatrix, invCellBoost);
//        TLP = translate(totalIsom, lightPositions[i]+vec4(0.,0.,sin(time/2000.)/5.,0.));
//        //run the lighting calculation for this  light position
//        //also run the shadow computation for this light position!
//        //add the resulting color to the original.
//    //    sh=softShadow(SP,TLP,6.);
//        
//        toLight = tangDirection(SP, TLP);
//        distToLight = exactDist(SP, TLP);
//        
//        
//        phong=phongShading(toLight,toViewer,N,distToLight,surfColor,lightIntensities[i],3.);
//        shade=shadowMarch(toLight,distToLight);
//        
//        //add this color to the pixel
//        color = shade*phong;
//        
//    }
//
//    
//    //LOCAL LIGHT
//    
//
//        //+vec4(0.05,0.05,0.05,0.);
//    //sh=softShadow(SP,localLightPos,2.);
//    toLight = tangDirection(SP, localLightPos);
//    distToLight=exactDist(SP, localLightPos);
//    
//    phong=phongShading(toLight,toViewer,N, distToLight,surfColor,localLightColor,0.05+5.*brightness*brightness);
//   // shade=shadowMarch(toLight,distToLight);
//    shade=1.;
//    //save shade until we have added all the phongs 
//    color = color+shade*phong;
//    
//    
//    //going to do shadows for the  local light:
//    
//    
//    //light color and intensity hard coded in
//
//
//    //move local light around by the generators to pick up lighting from nearby cells
//    //this is not a good fix for local lighting - as there may be more than six neighbor cubes (ie near the vertices)
//    for (int i=0; i<6; i++){
//        TLP=invGenerators[i]*localLightPos;
//        
//        toLight=tangDirection(SP,TLP);
//        distToLight=exactDist(SP,TLP);
//        
//        //sh=shadow(toLight,distToLight);
//        phong=phongShading(toLight,toViewer,N,distToLight,surfColor,localLightColor,0.05+5.*brightness*brightness);
//        //local lights intensity is a function of its radius: so it gets brighter when it grows:
//        color=color+phong;
//    }
////    
//    
//    
//    //now that we've done the lighting calculation; can do the other things that might be usefu; like adding fog
//    //this creates fog whose thickness depends on the distance marched (as a fraction of MAX_DIST)
//    //the FACTOR OF 20 HERE IS JUST EXPERIMENTAL RIGHT NOW: looks like we are never reaching max dist before iteration time runs out in Euclidean geometry
//    color =fog(color, vec3(0.02,0.02,0.02), distToViewer); 
//    return color;
//}
//
//
//
//
//
//
//
//
//




