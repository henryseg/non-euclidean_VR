
//----------------------------------------------------------------------------------------------------------------------
// Global Scene
//----------------------------------------------------------------------------------------------------------------------
//Again the global scene comes in two parts, the lights and the objects.
//These are then assembled into a single globalSDF





//----------------------------------------------------------------------------------------------------------------------
// Global Lighting
//----------------------------------------------------------------------------------------------------------------------

//Local Light Positions----------------------------------------
float globalSceneLights(vec4 p){
    
    return sphereSDF(p, localLightPos, 0.05); //below makes lights change radius in proportion to brightness
                     //lightRad);
}




//----------------------------------------------------------------------------------------------------------------------
// Global Scene Objects
//----------------------------------------------------------------------------------------------------------------------


//A single global sphere----------------------------------------
 float globalSceneObjects(vec4 p){
     vec4 center = vec4(0., 0.2, 0.3, 1.);
        return sphereSDF(p, center, 0.1);
 }

















//Global Scene SDF----------------------------------------
// measures distance from cellBoost * p to an object in the global scene

float globalSceneSDF(vec4 p){
    // correct for the fact that we have been moving
    vec4 absolutep = translate(cellBoost, p);
    float distance = MAX_DIST;
    float globalSceneDist;
    
    //Light Objects
    for (int i=0; i<4; i++){
        float objDist;
        objDist = sphereSDF(
        absolutep,
        lightPositions[i],
        0.05//radius of the light
        );
        distance = min(distance, objDist);
        if (distance < EPSILON){
            hitWhich = 1;
            colorOfLight = lightIntensities[i].xyz;//color of the light
            return distance;
        }
    }
    
    
    //Global Sphere Object
    globalSceneDist=globalSceneObjects(absolutep);
    distance = min(distance, globalSceneDist);
    
        if (globalSceneDist<EPSILON){
            hitWhich=2;
            return globalSceneDist;
        }


    return distance;

    // return MAX_DIST;
}


