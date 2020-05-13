


//----------------------------------------------------------------------------------------------------------------------
// Local Lighting
//----------------------------------------------------------------------------------------------------------------------

//Local Light Positions----------------------------------------
float localSceneLights(vec4 p){
    
    return sphereSDF(p, localLightPos, 0.05); //below makes lights change radius in proportion to brightness
                     //lightRad);
    
    
    
    
    
}


//
////Local Light Positions----------------------------------------
//float localSceneLights2(vec4 p, float threshhold){
//    //right now there are four lights, so we run through all of them
//   
//    float distance=sphereSDF(p, localLightPos, 0.05);
//    
//       for (int i=0; i<6; i++){
//        float lightDist;
//        lightDist = sphereSDF(p,invGenerators[i]*localLightPos,0.05//radius of the light
//        );
//        distance = min(distance, lightDist);
//       }
//        if (distance < threshhold){
//            isLocal=1;
//            hitWhich = 1;
//            colorOfLight=vec3(.5,.5,1.);
//            return distance;
//        }
//    
//    
//    return distance;
//    
//}
//
////for the default threshhold value
//float localSceneLights2(vec4 p){
//    return  localSceneLights2(p, EPSILON);
//}
//





//----------------------------------------------------------------------------------------------------------------------
// Local Scene Objects
//----------------------------------------------------------------------------------------------------------------------


//There are three choices of local tiling SDFs here; it is possible to switch between them via the uniform "display"

//Local Objects Choice 1
float tilingSceneSDF(vec4 p){
    //vec4 center = vec4(0., 0., 0., 1.);
//          float sphere = sphereSDF(p, center, 0.68);
//        return -sphere;
//    0.6,0.33  give a good size of holes
    float centerHole=sphereSDF(p,ORIGIN,0.66);
    float cornerHole=sphereSDF(abs(p),vec4(0.5,0.5,0.5,1),0.23);
    return -min(centerHole, cornerHole);
}

//Local Objects Choice 2
float cylSceneSDF(vec4 p){
       
   // vec3 q=vec3(abs(p.x),abs(p.y),abs(p.z));
   //return max(q.x, max(q.y, q.z)) - 0.15 + dot(q, q)*0.5;
    
 vec4 center = vec4(0., 0., 0., 1.);
    float cylZ=cylSDF(p,0.1);
    float cylY =cylSDF(vec4(p.x,p.z,p.y,1.),0.1);
    float cylX =cylSDF(vec4(p.y,p.z,p.x,1.),0.1);
   return min(min(cylZ,cylY),cylX);
    
    
    //return sphereSDF(p,ORIGIN,0.02);
       // return fatEllipsoidSDF(p, center, 0.06);
}


//Local Objects Choice 3
float latticeSceneSDF(vec4 p){
       
   // vec3 q=vec3(abs(p.x),abs(p.y),abs(p.z));
   //return max(q.x, max(q.y, q.z)) - 0.15 + dot(q, q)*0.5;
    
    return sphereSDF(p,ORIGIN,0.2);
  
// return fatEllipsoidSDF(p, center, 0.06);
}


//Function which picks which Local Objects to draw based on a uniform
float localSceneObjects(vec4 p){
    if(display==1){
        return tilingSceneSDF(p);
    }
    if(display==2){
        return cylSceneSDF(p);
    }
        if(display==3){
        return latticeSceneSDF(p);
    }
}










//----------------------------------------------------------------------------------------------------------------------
// Local Scene SDF
//----------------------------------------------------------------------------------------------------------------------



float localSceneSDF(vec4 p,float threshhold){
    float lightDist;
    float sceneDist;
    float distance = MAX_DIST;

//you are the lightsource, so this will draw a ball around you.  BUT- in the raymarcher we have a  "bubble" around oruselves that  we skip before marching, so we don't see this one, only its other images.
    //lightDist=localSceneLights2(p);
    lightDist=localSceneLights(p);
    distance=min(distance, lightDist);
    
    if (distance < threshhold){
        isLocal=1;
        hitWhich = 1;
        colorOfLight=vec3(.8,.8,1.6);
        
        
        return distance;
    }

    //distance to scene is minimum of the objects and the bubble around the viewer
    //sceneDist=max(viewerBubble(p),localSceneObjects(p));
    sceneDist=localSceneObjects(p);
    distance = min(distance, sceneDist);
    
        if (sceneDist<threshhold){
            isLocal=1;
            hitWhich=3;
            return sceneDist;
        }


    return distance;
}


//an overloading of the above for the default threshhold EPSILON
float localSceneSDF(vec4 p){
    return localSceneSDF(p, EPSILON);
}







