bool isOutsideCell(vec4 p, out mat4 fixMatrix){
    // check if the given point p is in the fundamental domain of the lattice.
//    if (p.x > modelHalfCube){
//        fixMatrix = invGenerators[0];
//        return true;
//    }
//    if (p.x < -modelHalfCube){
//        fixMatrix = invGenerators[1];
//        return true;
//    }
//    if (p.y > modelHalfCube){
//        fixMatrix = invGenerators[2];
//        return true;
//    }
//    if (p.y < -modelHalfCube){
//        fixMatrix = invGenerators[3];
//        return true;
//    }

    if (p.z > modelHalfCube){
        fixMatrix = invGenerators[4];
        return true;
    }
    if (p.z < -modelHalfCube){
        fixMatrix = invGenerators[5];
        return true;
    }
    return false;

}

bool isOutsideCell(tangVector v, out mat4 fixMatrix){
    // overload of the previous method with tangent vector
    return isOutsideCell(v.pos, fixMatrix);
}


//--------------------------------------------
// GEOM DEPENDENT
//--------------------------------------------

//--------------------------------------------
// NOT GEOM DEPENDENT
//--------------------------------------------


// variation on the raymarch algorithm
// now each step is the march is made from the previously achieved position (useful later for Sol).

//void raymarch(tangVector rayDir, out mat4 totalFixMatrix){
//    mat4 fixMatrix;
//    float marchStep = MIN_DIST;
//    float globalDepth = MIN_DIST;
//    float localDepth = MIN_DIST;
//    tangVector tv = rayDir;
//    tangVector localtv = rayDir;
//    totalFixMatrix = mat4(1.0);
//
//
//    // Trace the local scene, then the global scene:
//    for (int i = 0; i < MAX_MARCHING_STEPS; i++){
//        localtv = flow(localtv, marchStep);
//
//        if (isOutsideCell(localtv, fixMatrix)){
//            totalFixMatrix = fixMatrix * totalFixMatrix;
//            localtv = translate(fixMatrix, localtv);
//            marchStep = MIN_DIST;
//        }
//        else {
//            float localDist = min(0.1, localSceneSDF(localtv.pos));
//            if (localDist < EPSILON){
//                hitWhich = 3;
//                sampletv = localtv;
//                break;
//            }
//            marchStep = localDist;
//            globalDepth += localDist;
//        }
//    }
//
//    // Set for localDepth to our new max tracing distance:
//    localDepth = min(globalDepth, MAX_DIST);
//    // localDepth= MAX_DIST;
//    globalDepth = MIN_DIST;
//    marchStep = MIN_DIST;
//    for (int i = 0; i < MAX_MARCHING_STEPS; i++){
//        tv = flow(tv, marchStep);
//
//        float globalDist = globalSceneSDF(tv.pos);
//        if (globalDist < EPSILON){
//            // hitWhich has now been set
//            totalFixMatrix = mat4(1.0);
//            sampletv = tv;
//            return;
//        }
//        marchStep = globalDist;
//        globalDepth += globalDist;
//        if (globalDepth >= localDepth){
//            break;
//        }
//    }
//}


float distToViewer;

int BINARY_SEARCH_STEPS=10;

//another variation on raymarch (This one adapted from the dynamHyp code that Steve and Henry wrote, where we make sure that we never teleport TOO far past a wall)


void raymarch(tangVector rayDir, out mat4 totalFixMatrix){
    mat4 fixMatrix;
    mat4 testFixMatrix;
    float marchStep = MIN_DIST;
    float testMarchStep = MIN_DIST;
    float globalDepth = MIN_DIST;
    float localDepth = MIN_DIST;
   
    tangVector tv = rayDir;
    tangVector localtv = rayDir;
    tangVector testlocaltv = rayDir;
    tangVector bestlocaltv = rayDir;
    totalFixMatrix = mat4(1.);


    // Trace the local scene, then the global scene:

   localtv=flow(localtv,1.);
    
    
    for (int i = 0; i < MAX_MARCHING_STEPS; i++){
        
   if(localDepth>MAX_DIST){
       localDepth=MAX_DIST;
       break;
   }
      float localDist = localSceneSDF(localtv.pos);
      if (localDist < EPSILON){
          sampletv = localtv;
          distToViewer=localDepth;
          break;
      }
      marchStep = localDist;
    
    
       
      testlocaltv = flow(localtv, marchStep);
      if (isOutsideCell(testlocaltv, fixMatrix)){
        bestlocaltv = testlocaltv;
          
          
          //commenting out this for loop brings us back to what we were doing before...
        for (int j = 0; j < BINARY_SEARCH_STEPS; j++){
          ////// do binary search to get close to but outside this cell - 
          ////// dont jump too far forwards, since localSDF can't see stuff in the next cube
          testMarchStep = marchStep - pow(0.5,float(j+1))*localDist;
          testlocaltv = flow(localtv, testMarchStep);
          if ( isOutsideCell(testlocaltv, testFixMatrix) ){
            marchStep = testMarchStep;
            bestlocaltv = testlocaltv;
            fixMatrix = testFixMatrix;
          }
        }
        localtv = bestlocaltv;
        totalFixMatrix = fixMatrix*totalFixMatrix;
        localtv = translate(fixMatrix, localtv);
        localDepth += marchStep; 
        marchStep = MIN_DIST;
      }
        
      else{ 
          localtv = testlocaltv; 
          localDepth += marchStep; 
        }
        
        
      }
    
      localDepth=min(localDepth, MAX_DIST);
    
  
    globalDepth = MIN_DIST;
    marchStep = MIN_DIST;
    for (int i = 0; i < MAX_MARCHING_STEPS; i++){
        tv = flow(tv, marchStep);

        float globalDist = globalSceneSDF(tv.pos);
        if (globalDist < EPSILON){
            totalFixMatrix = mat4(1.);
            sampletv = tv;
            distToViewer=globalDepth;
            return;
        }
        marchStep = globalDist;
        globalDepth += globalDist;
        if (globalDepth >= localDepth){
            break;
        }
      }
    
}




void reflectmarch(tangVector rayDir, out mat4 totalFixMatrix){
    mat4 fixMatrix;
    mat4 testFixMatrix;
    float marchStep = MIN_DIST;
    float testMarchStep = MIN_DIST;
    float globalDepth = MIN_DIST;
    float localDepth = MIN_DIST;
   
    tangVector tv = rayDir;
    tangVector localtv = rayDir;
    tangVector testlocaltv = rayDir;
    tangVector bestlocaltv = rayDir;
    totalFixMatrix = mat4(1.);


    // Trace the local scene, then the global scene:

   localtv=flow(localtv,0.2);
    
    
    for (int i = 0; i < MAX_MARCHING_STEPS; i++){
        
   if(localDepth>5.){
       localDepth=MAX_DIST;
       break;
   }
      float localDist = localSceneSDF(localtv.pos);
      if (localDist < EPSILON){
          sampletv = localtv;
          distToViewer=localDepth;
          break;
      }
      marchStep = localDist;
    
    
       
      testlocaltv = flow(localtv, marchStep);
      if (isOutsideCell(testlocaltv, fixMatrix)){
        bestlocaltv = testlocaltv;
          
          
          //commenting out this for loop brings us back to what we were doing before...
        for (int j = 0; j < BINARY_SEARCH_STEPS; j++){
          ////// do binary search to get close to but outside this cell - 
          ////// dont jump too far forwards, since localSDF can't see stuff in the next cube
          testMarchStep = marchStep - pow(0.5,float(j+1))*localDist;
          testlocaltv = flow(localtv, testMarchStep);
          if ( isOutsideCell(testlocaltv, testFixMatrix) ){
            marchStep = testMarchStep;
            bestlocaltv = testlocaltv;
            fixMatrix = testFixMatrix;
          }
        }
        localtv = bestlocaltv;
        totalFixMatrix = fixMatrix*totalFixMatrix;
        localtv = translate(fixMatrix, localtv);
        localDepth += marchStep; 
        marchStep = MIN_DIST;
      }
        
      else{ 
          localtv = testlocaltv; 
          localDepth += marchStep; 
        }
        
        
      }
    
      localDepth=min(localDepth, MAX_DIST);
    
  
    globalDepth = MIN_DIST;
    marchStep = MIN_DIST;
    for (int i = 0; i < MAX_MARCHING_STEPS; i++){
        tv = flow(tv, marchStep);

        float globalDist = globalSceneSDF(tv.pos);
        if (globalDist < EPSILON){
            totalFixMatrix = mat4(1.);
            sampletv = tv;
            distToViewer=globalDepth;
            return;
        }
        marchStep = globalDist;
        globalDepth += globalDist;
        if (globalDepth >= localDepth){
            break;
        }
      }
    
}





//void raymarch(tangVector rayDir, out mat4 totalFixMatrix){
//    mat4 fixMatrix;
//    float globalDepth = MIN_DIST;
//    float localDepth = MIN_DIST;
//    tangVector tv = rayDir;
//    tangVector localtv = rayDir;
//    totalFixMatrix = mat4(1.0);
//
//
//    // Trace the local scene, then the global scene:
//    for (int i = 0; i < MAX_MARCHING_STEPS; i++){
//        tangVector localEndtv = flow(localtv, localDepth);
//
//        if (isOutsideCell(localEndtv, fixMatrix)){
//            totalFixMatrix = fixMatrix * totalFixMatrix;
//            localtv = translate(fixMatrix, localEndtv);
//            localDepth = MIN_DIST;
//        }
//        else {
//            float localDist = min(0.1, localSceneSDF(localEndtv.pos));
//            if (localDist < EPSILON){
//                hitWhich = 3;
//                sampletv = localEndtv;
//                break;
//            }
//            localDepth += localDist;
//            globalDepth += localDist;
//        }
//    }
//
//
//    // Set for localDepth to our new max tracing distance:
//    localDepth = min(globalDepth, MAX_DIST);
//    globalDepth = MIN_DIST;
//    for (int i = 0; i < MAX_MARCHING_STEPS; i++){
//        tangVector globalEndtv = flow(tv, globalDepth);
//
//        float globalDist = globalSceneSDF(globalEndtv.pos);
//        if (globalDist < EPSILON){
//            // hitWhich has now been set
//            totalFixMatrix = mat4(1.0);
//            sampletv = globalEndtv;
//            return;
//        }
//        globalDepth += globalDist;
//        if (globalDepth >= localDepth){
//            break;
//        }
//    }
//}
