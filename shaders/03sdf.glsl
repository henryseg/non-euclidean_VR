//---------------------------------------------------------------------
//Raymarch Primitives
//---------------------------------------------------------------------


float sphereSDF(vec4 p, vec4 center, float radius){
    // more precise computation
    float fakeDist = fakeDistance(p, center);

    if (FAKE_DIST_SPHERE) {
        return fakeDist - radius;
    }
    else {
        if (fakeDist > 10. * radius) {
            return fakeDist - radius;
        }
        else {
            return exactDist(p, center) - radius;
        }
    }
}

float ellipsoidSDF(vec4 p, vec4 center, float radius){
    return ellipsoidDistance(p,center)-radius;
}

float centerSDF(vec4 p, vec4 center, float radius){
    return sphereSDF(p, center, radius);
}






//---------------------------------------------------------------------
// Scene Definitions
//---------------------------------------------------------------------
// Turn off the local scene
// Local signed distance function : distance from p to an object in the local scene

// LOCAL OBJECTS SCENE ++++++++++++++++++++++++++++++++++++++++++++++++
//float localSceneSDF(vec4 p){
//    vec4 center = vec4(0, 0, 0., 1.);
//    float sphere = centerSDF(p, ORIGIN, 0.68);
//    float final = -sphere;
//    return final;
//}


float localSceneSDF(vec4 p){
    float earthDist;
    float tilingDist;
    float lightDist;
    float distance = MAX_DIST;
    
     if(RENDER_LOCAL_LIGHTS){
     vec4 lightCenter=localLightPos;
      lightDist=sphereSDF(p,lightCenter,0.05);
      distance =min(distance, lightDist);
        if (lightDist < EPSILON){
           // hitLocal = true;
            hitWhich = 1;
            globalLightColor =vec4(localLightColor,1);
            return lightDist;
        }
 }
    

    
    if(LOCAL_EARTH){
       vec4 earthCenter=localEarthBoost*ORIGIN;
       earthDist=sphereSDF(p,earthCenter,0.15);
        distance=min(distance,earthDist);
        if(earthDist < EPSILON){
           // hitLocal = true;
            hitWhich = 7;
            return earthDist;
        }  
    }
 if(TILING){
    // tilingDist=ellipsoidSDF(p,vec4(0.,0.,0.3,1.),0.007);
    tilingDist = -sphereSDF(p, ORIGIN, 0.68);
     distance=min(distance, tilingDist);
        if(tilingDist < EPSILON){
           // hitLocal = true;
            hitWhich=3;
            return tilingDist;
        }
 }
    return distance;
}
   

//earth scene

//float localSceneSDF(vec4 p){
//    float sphere=MAX_DIST;
//    if(LOCAL_EARTH){
//    vec4 earthCenter = 
//    sphere = sphereSDF(p, earthCenter, 0.1);
//    }
//    
//    
//
//    return min(sphere,tiling);
//}


// GLOBAL OBJECTS SCENE ++++++++++++++++++++++++++++++++++++++++++++++++
// Global signed distance function : distance from cellBoost * p to an object in the global scene
float globalSceneSDF(vec4 p){
    float earthDist;
    vec4 absolutep = cellBoost * p;// correct for the fact that we have been moving
    float distance = MAX_DIST;
    //Light Objects
//    for (int i=0; i<4; i++){
//        float objDist;
//        objDist = sphereSDF(
//        absolutep,
//        lightPositions[i],
//        0.0//0.05
//        );
//        distance = min(distance, objDist);
//        if (distance < EPSILON){
//            hitWhich = 1;
//            globalLightColor = lightIntensities[i];
//            return distance;
//        }
//    }
    
    
    //Global Sphere Object
    float objDist;
    objDist = sphereSDF(absolutep, globalObjectBoost[3], globalObjectRadius);
    distance = min(distance, objDist);
    if (distance < EPSILON){
        hitWhich = 2;
    }
    
    if(GLOBAL_EARTH){
       vec4 earthCenter=globalEarthBoost*ORIGIN;
       earthDist=sphereSDF(absolutep,earthCenter,0.15);
        distance=min(distance,earthDist);
        if(earthDist < EPSILON){
           // hitLocal = true;
            hitWhich = 8;
            return earthDist;
        }  
    }
    
    return distance;
}
