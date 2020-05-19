//----------------------------------------------------------------------------------------------------------------------
// Light Attenuation with  Distance and Angle
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




//in the isotropic geometries, the lighting attenuation only depends on distance.  In non-isotropic geometreis this also depends on angle.
//in S2xR and H2xR this angular dependence is calculable
//in the other three, its probably a complex function of angle and distance
//the function below is an overload of the above, for when we are able to provide the angular function

float lightAtt(float dist, tangVector angle){
    //distance is the distance between the viewer and the lightsource.
    //angle is the unit tangent vector pointing from the light source towards the illuminated object
        if (FAKE_LIGHT_FALLOFF){
        //fake falloff
        return 0.1+0.5*dist;
    }
    
    //actual distance function
    return 0.1+areaElement(dist,angle);//make a function like surfArea in globalGeometry to compute this
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
    
    if (hitLocal){ //local scene
        tangVector tv = tangVector(p,
        basis_x * (localSceneSDF(p + newEp*basis_x) - localSceneSDF(p - newEp*basis_x)) +
        basis_y * (localSceneSDF(p + newEp*basis_y) - localSceneSDF(p - newEp*basis_y)) +
        basis_z * (localSceneSDF(p + newEp*basis_z) - localSceneSDF(p - newEp*basis_z))
        );
       
        return tangNormalize(tv);

    }
    else { //global scene
         tangVector tv = tangVector(p,
        basis_x * (globalSceneSDF(p + newEp*basis_x) - globalSceneSDF(p - newEp*basis_x)) +
        basis_y * (globalSceneSDF(p + newEp*basis_y) - globalSceneSDF(p - newEp*basis_y)) +
        basis_z * (globalSceneSDF(p + newEp*basis_z) - globalSceneSDF(p - newEp*basis_z))
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


//a separate function is to be written to figure out the correct fixPosition depending on the case we are in (local lighting of local object, or of global object, or reflected object, etc)
vec3 localLight(vec4 lightPosition, vec3 lightColor, float lightIntensity,bool marchShadows, vec3 surfColor,Isometry fixPosition){
    
    //start with no color for the surface, build it up slowly below
    vec3 localColor=vec3(0.);
    vec3 phong=vec3(0.);
    float shadow=1.;//1 means no shadows
    
    vec4 translatedLightPosition;
    tangVector toLight;
    float distToLight;
    
    //----------------FOR THE MAIN LIGHT---------------
    //translate the light relative the object: if its a local object, don't do anything.
    //if its a global object; this fixPosition is something nontrivial
    translatedLightPosition=translate(fixPosition,lightPosition);
    
    
    //we start being given the light location, and have outside access to our location, and the point of interest on the surface
    //now compute these  two useful  quantites out of this data
    toLight=tangDirection(surfacePosition, translatedLightPosition);//tangent vector on surface pointing to light
    distToLight=exactDist(surfacePosition, translatedLightPosition);//distance from sample point to light source
    
    
    //this is all the info we need to get Phong for this light source
    phong=phongShading(toLight,toViewer,surfNormal,distToLight,surfColor,lightColor,lightIntensity);
    
    
    //now for this same light source, we compute the shadow
    //this  original sourxe almost never produces shadows (if the sdf is concave,symmetric about center)
    if(marchShadows){//this is a uniform controlling if shadows are rendered or not
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
        translatedLightPosition=invGenerators[i]*translate(fixPosition,lightPosition);
        
        toLight=tangDirection(surfacePosition,translatedLightPosition);//tangent vector on surface pointing to light
        distToLight=exactDist(surfacePosition, translatedLightPosition);//distance from sample point to light source
        //compute the contribution to phong shading
        phong=phongShading(toLight,toViewer,surfNormal,distToLight,surfColor,lightColor,lightIntensity);
        //compute the shadows
       if(marchShadows){
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










//----------------------------------------------------------------------------------------------------------------------
// Packaging this up: GLOBAL LIGHTING ROUTINE
//----------------------------------------------------------------------------------------------------------------------




//this code runs for a single global light
//to draw all global lights, need a function which runs this for each light in the scene
//there is no additional computaiton saved by trying to do all lights together, as everything (light positions etc) are all run independently
vec3 globalLight(vec4 lightPosition, vec3 lightColor, float lightIntensity,bool marchShadows, vec3 surfColor, Isometry fixPosition){
    
    //start with no color for the surface, build it up slowly below
    vec3 globalColor=vec3(0.);
    vec3 phong=vec3(0.);
    float shadow=1.;//1 means no shadows
    
    tangVector toLight;
    float distToLight;
    vec4 fixedLightPos;
    //Isometry totalIsom;
    

    //totalIsom=composeIsometry(totalFixMatrix, invCellBoost);
    fixedLightPos=translate(fixPosition,lightPosition);
    
    //we start being given the light location, and have outside access to our location, and the point of interest on the surface
    //now compute these  two useful  quantites out of this data
    toLight=tangDirection(surfacePosition, fixedLightPos);//tangent vector on surface pointing to light
    distToLight=exactDist(surfacePosition, fixedLightPos);//distance from sample point to light source
    
    
    
    //this is all the info we need to get Phong for this light source
    phong=phongShading(toLight,toViewer,surfNormal,distToLight,surfColor,lightColor,lightIntensity);
    
    //now for this same light source, we compute the shadow
    //this  original sourxe almost never produces shadows (if the sdf is concave,symmetric about center)
    if(marchShadows){//this is a boolean
    shadow=shadowMarch(toLight,distToLight);
    }
    globalColor=shadow*phong;

    
    
    //return this value
    return globalColor;
    
}








    





//----------------------------------------------------------------------------------------------------------------------
// MIXING COLORS OF LOCAL AND GLOBAL LIGHTS
//----------------------------------------------------------------------------------------------------------------------



//chooses which  proprotion the local and global light colors make up in the image
//right now, function is not very sophisticated, but could be changed in the future
vec3 mixLights(float proportion, vec3 light1,vec3 light2){
    return (1.-proportion)*light1+proportion*light2;
}











