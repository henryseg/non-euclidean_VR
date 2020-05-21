
//----------------------------------------------------------------------------------------------------------------------
// Global Scene
//----------------------------------------------------------------------------------------------------------------------
//Again the global scene comes in two parts, the lights and the objects.
//These are then assembled into a single globalSDF





//----------------------------------------------------------------------------------------------------------------------
// Global Lighting
//----------------------------------------------------------------------------------------------------------------------

//Local Light Positions----------------------------------------
float globalSceneLights(vec4 p, float threshhold){
    //right now there are four lights, so we run through all of them
   
    float distance=MAX_DIST;
    
       for (int i=0; i<4; i++){
        float lightDist;
        lightDist = sphereSDF(p,lightPositions[i],0.05//radius of the light
        );
           
        distance = min(distance, lightDist);
        if (distance < threshhold){
            hitLocal=false;
            hitWhich = 1;
            colorOfLight = lightIntensities[i].xyz;//color of the light
            return distance;
        }
    }
    
    return distance;
    
}

//for the default threshhold value
float globalSceneLights(vec4 p){
    return  globalSceneLights(p, EPSILON);
}


//----------------------------------------------------------------------------------------------------------------------
// Global Scene Objects
//----------------------------------------------------------------------------------------------------------------------


//A single global sphere----------------------------------------
//to be able to texture this thing correctly as the earth, we need to position it using global object boost
 float globalSceneObjects(vec4 p){
     vec4 center = translate(globalObjectBoost,ORIGIN);
        return sphereSDF(p, center, 0.3);
    
 }











//----------------------------------------------------------------------------------------------------------------------
// Global Scene SDF
//----------------------------------------------------------------------------------------------------------------------

// measures distance from cellBoost * p to an object in the global scene

float globalSceneSDF(vec4 p, float threshhold){
    // correct for the fact that we have been moving
    vec4 absolutep = translate(cellBoost, p);
    
    float lightDist;
    float sceneDist;
    float distance = MAX_DIST;
    
    
    lightDist=globalSceneLights(absolutep);
    //running global scene lights already stops and sets hitWhich etc if we reach a light
    distance=min(distance, lightDist);
    

    
    //now move on to the global objects
    sceneDist=globalSceneObjects(absolutep);
    distance = min(distance, sceneDist);
    
     if (sceneDist<threshhold){
            hitLocal=false;
            hitWhich=2;
         //set to mean global object
            return sceneDist;
        }


    return distance;

}

float globalSceneSDF(vec4 p){
    return  globalSceneSDF(p, EPSILON);
}

