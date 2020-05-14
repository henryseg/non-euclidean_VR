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
    vec3 specular = lightColor.rgb * pow(rDotV,15.0);
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
//the factor of 20 is just empirical here to make things look good - apparently we never get near max dist in euclidean geo
vec3 fog(vec3 color, vec3 fogColor, float distToViewer){
    float fogDensity=smoothstep(0., MAX_DIST/20., distToViewer);
    return mix(color, fogColor, fogDensity); 
}










//----------------------------------------------------------------------------------------------------------------------
// 
//----------------------------------------------------------------------------------------------------------------------

// LIGHTING FUNCTIONS
//above this are the commands for building the physics of lighting
//below this is code implementing these for specific situations (local lights, global lights, reflected lights, etc)
//no new lighting methods are below, only packaging.

//----------------------------------------------------------------------------------------------------------------------
// 
//----------------------------------------------------------------------------------------------------------------------





//----------------------------------------------------------------------------------------------------------------------
// Packaging this up: LOCAL LIGHTING ROUTINES
//----------------------------------------------------------------------------------------------------------------------



//this function takes in the necessary information for a local light, and  does the lighting computation for it, and its translates in the neighboring six cells (adjacent through faces)
//this  is meant to be run inside of some larger shading function, where we already have access to the following values:
//vec4 surfacePosition, tangVector toViewer, tangVector surfNormal
//boolean tells us if we want to have the shadow  computation turned on or not

//this is the right code for local lighting of LOCAL objects
//need to do something different with the value of totalFixMatrix for global objects....the specularity on a global object changes when I CHANGE BOX
//it also changes the reflection  of global light...
vec3 localLighting(vec4 lightPosition, vec3 lightColor, float lightIntensity,vec3 surfColor, bool renderShadow){
    
    //start with no color for the surface, build it up slowly below
    vec3 localColor=vec3(0.);
    vec3 phong=vec3(0.);
    float shadow=1.;//1 means no shadows
    
    tangVector toLight;
    float distToLight;
    
    //----------------FOR THE MAIN LIGHT---------------
    

    
    //we start being given the light location, and have outside access to our location, and the point of interest on the surface
    //now compute these  two useful  quantites out of this data
    toLight=tangDirection(surfacePosition, lightPosition);//tangent vector on surface pointing to light
    distToLight=exactDist(surfacePosition, lightPosition);//distance from sample point to light source
    
    
    //this is all the info we need to get Phong for this light source
    phong=phongShading(toLight,toViewer,surfNormal,distToLight,surfColor,lightColor,lightIntensity);
    
    
    //now for this same light source, we compute the shadow
    //this  original sourxe almost never produces shadows (if the sdf is concave,symmetric about center)
    if(renderShadow){
    shadow=shadowMarch(toLight,distToLight);
    }
    localColor=shadow*phong;
    // alternative: we may wish to  try to turn off shadows when you are far away to save steps:
        //    if(distToViewer<5.||distToLight>5.){
        //        shadow=shadowMarch(toLight,distToLight);
        //        emitLocalColor=shadow*phong;
        //    }
        //    else{
        //        emitLocalColor=phong;
        //     }
    

    //----------------SAME CODE FOR THE NEIGHBOR LIGHTS---------------
    
    
    //because its a local light, we need to account for light from its neighbors as well:
    //this is not a good fix for local lighting - as there may be more than six neighbor cubes (ie near the vertices)
    for (int i=0; i<6; i++){
        lightPosition=invGenerators[i]*localLightPos;
        
        toLight=tangDirection(surfacePosition,lightPosition);//tangent vector on surface pointing to light
        distToLight=exactDist(surfacePosition, lightPosition);//distance from sample point to light source
        //compute the contribution to phong shading
        phong=phongShading(toLight,toViewer,surfNormal,distToLight,surfColor,lightColor,lightIntensity);
        //compute the shadows
       if(renderShadow){
        shadow=shadowMarch(toLight,distToLight);
        }
        localColor+=shadow*phong;
//            if(computeShadows==true&&distToViewer<3.||distToLight<5.){
//            shadow=shadowMarch(toLight,distToLight);
//            localColor+=shadow*phong;
//            }
//            else{
//               localColor+=phong;
//            }  
   }
    
    //now, have 7 contributions to the local color
    //renormalize the emitted color by dividing by the nubmer of total light sources which have contributed.
    localColor=localColor/7.;
    
    //return this value
    return localColor;
    
}


//for local lights, whether or not we want to use them as a reflection or as a normal light, the code can be the same
//it might be better in practice to have seperate code for the reflection, as we can make things way cheaper if we find shortcuts
//so, I've given the name to a reflected version below
//shadows are turned off that would be way too much raymarching!
vec3 reflLocalLighting(vec4 lightPosition, vec3 lightColor, float lightIntensity,vec3 surfColor){
    return localLighting(lightPosition,lightColor,lightIntensity, surfColor,false);
}

















//----------------------------------------------------------------------------------------------------------------------
// Packaging this up: GLOBAL LIGHTING ROUTINES
//----------------------------------------------------------------------------------------------------------------------



//this function takes in the list of global lights, and computes their total lighting contribution to the pixel
//this  is meant to be run inside of some larger shading function, where we already have access to the following values:
//vec4 surfacePosition, tangVector toViewer, tangVector surfNormal
//RIGHT NOW: the global light positions etc are currently passed as uniforms, so they are already available and thats why
//they do not appear as arguments in this function

//FOR SOME REASON:
//this is NOT WORKING as a separate function right now.
//this same code is copied into the shader, and it runs fine.
//will figure this out later
vec3 globalLighting(vec3 surfColor,bool renderShadow){
    
        //start with no color for the surface, build it up slowly below
    vec3 globalColor=vec3(0.);
    vec3 phong=vec3(0.);
    float shadow=1.;//1 means no shadows
    
    tangVector toLight;
    float distToLight;
    vec4 lightPosition;
    
    //idea is the same as above: given each lights  position we compute the direction toLight and distToLight, and use this for phong shading and shadow raymarching.
        for (int i=0; i<4; i++){
        
        //first  complication: we have been moving, and so to account for this we need to move the global light from its stored position
        //to its position relative us, using totalIsom
        Isometry totalIsom=composeIsometry(totalFixMatrix, invCellBoost);
        lightPosition=translate(totalIsom,lightPositions[i]);
        
        //again, we compute the geometry of where the light is rel the surface point    
       
        toLight=tangDirection(surfacePosition,lightPosition);//tangent vector on surface pointing to light
        distToLight=exactDist(surfacePosition, lightPosition);//distance from sample point to light source
        //then we use this to compute both the phong shading and the shadowfx
        phong=phongShading(toLight,toViewer,surfNormal,distToLight,surfColor,lightIntensities[i].xyz,4.+4.*brightness*brightness);
            
        if (renderShadow){
        shadow=shadowMarch(toLight,distToLight);
        }
        globalColor+=shadow*phong;
            //as before, we could try and stop shadows early if it saves enough cycles
        //        if(distToViewer<5.||distToLight>5.){
        //            shadow=shadowMarch(toLight,distToLight);
        //            emitGlobalColor+=shadow*phong;
        //        }
        //        else{
        //            emitGlobalColor+=phong;
        //        }

   }
    
    //we now have added together the intensity due to four light sources, so must normalize
    globalColor=globalColor/4.;
    
    //return this color
    return globalColor;
    
}
    

//for global lighting, the conversion to reflection is not identical
//there is a change in how  we are keeping track of our relative position
//invCellBoost keeps track of our location, and we include it above as we are computing the lighting with respect to us
//but in reflection, we are raymarching with the piece of the surface as our "eye", which is fixed: so we don't include this adjustment
//also  no shadows...
vec3 reflGlobalLighting(vec3 surfColor){
    
    //start with no color for the surface, build it up slowly below
    vec3 globalColor=vec3(0.);
    vec3 phong;
    
    tangVector toLight;
    float distToLight;
    
    //idea is the same as above: given each lights  position we compute the direction toLight and distToLight, and use this for phong shading and shadow raymarching.
        for (int i=0; i<4; i++){
        
        //first  complication: we have been moving, and so to account for this we need to move the global light from its stored position
        //to its position relative us, using totalIsom
        Isometry totalIsom=totalFixMatrix;
        vec4 lightPosition=translate(totalIsom,lightPositions[i]);
        
        //again, we compute the geometry of where the light is rel the surface point    
        toLight=tangDirection(surfacePosition,lightPosition);//tangent vector on surface pointing to light
        distToLight=exactDist(surfacePosition, lightPosition);//distance from sample point to light source
        //then we use this to compute both the phong shading and the shadow
        phong=phongShading(toLight,toViewer,surfNormal,distToLight,surfColor,lightIntensities[i].xyz,lightIntensities[i].w);
        globalColor+=phong;
   }
    
    //we now have added together the intensity due to four light sources, so must normalize
    globalColor=globalColor/4.;
    
    //return this color
    return globalColor;
    
}




//OLD
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




