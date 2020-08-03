


 


// check if the given point p is in the fundamental domain of the lattice.

float denominator=GoldenRatio+2.;

bool isOutsideCell(vec4 p, out Isometry fixMatrix){
    //vec4 ModelP= modelProject(p);


    //lattice basis divided by the norm square
    vec4 v1 = vec4(GoldenRatio, -1., 0., 0.);
    vec4 v2 = vec4(1., GoldenRatio, 0., 0.);
    vec4 v3 = vec4(0., 0., 1./z0, 0.);

    if (display!=3){
        if (dot(p, v3) > 0.5) {
            fixMatrix = Isometry(invGenerators[4]);
            return true;
        }
        if (dot(p, v3) < -0.5) {
            fixMatrix = Isometry(invGenerators[5]);
            return true;
        }
    }

    if (dot(p, v1) > 0.5) {
        fixMatrix = Isometry(invGenerators[0]);
        return true;
    }
    if (dot(p, v1) < -0.5) {
        fixMatrix = Isometry(invGenerators[1]);
        return true;
    }
    if (dot(p, v2) > 0.5) {
        fixMatrix = Isometry(invGenerators[2]);
        return true;
    }
    if (dot(p, v2) < -0.5) {
        fixMatrix = Isometry(invGenerators[3]);
        return true;
    }
    return false;
}


// overload of the previous method with tangent vector
bool isOutsideCell(tangVector v, out Isometry fixMatrix){
    return isOutsideCell(v.pos, fixMatrix);
}


// overload of the previous method with local tangent vector
bool isOutsideCell(localTangVector v, out Isometry fixMatrix){
    return isOutsideCell(v.pos, fixMatrix);
}


//----------------------------------------------------------------------------------------------------------------------
// GEOM DEPENDENT
//----------------------------------------------------------------------------------------------------------------------

//----------------------------------------------------------------------------------------------------------------------
// DOING THE RAYMARCH
//----------------------------------------------------------------------------------------------------------------------


// variation on the raymarch algorithm
// now each step is the march is made from the previously achieved position (useful later for Sol).

//void raymarch(tangVector rayDir, out Isometry totalFixMatrix){
//    Isometry fixMatrix;
//    float marchStep = MIN_DIST;
//    float globalDepth = MIN_DIST;
//    float localDepth = MIN_DIST;
//    tangVector tv = rayDir;
//    tangVector localtv = rayDir;
//    totalFixMatrix = identityIsometry;
//
//
//    // Trace the local scene, then the global scene:
//
//    if (TILING_SCENE){
//        for (int i = 0; i < MAX_MARCHING_STEPS; i++){
//            localtv = flow(localtv, marchStep);
//
//            if (isOutsideCell(localtv, fixMatrix)){
//                totalFixMatrix = composeIsometry(fixMatrix, totalFixMatrix);
//                localtv = translate(fixMatrix, localtv);
//                marchStep = MIN_DIST;
//            }
//            else {
//                float localDist = min(5., localSceneSDF(localtv.pos));
//                if (localDist < EPSILON){
//                    // hitWhich = 3;
//                    sampletv = localtv;
//                    break;
//                }
//                marchStep = localDist;
//                globalDepth += localDist;
//            }
//        }
//        localDepth = min(globalDepth, MAX_DIST);
//    }
//    else {
//        localDepth=MAX_DIST;
//    }
//
//
//    if (GLOBAL_SCENE){
//        globalDepth = MIN_DIST;
//        marchStep = MIN_DIST;
//
//        for (int i = 0; i < MAX_MARCHING_STEPS; i++){
//            tv = flow(tv, marchStep);
//
//            /*
//            if (i == 15) {
//                hitWhich = 5;
//                debugColor = 10000. * vec3(0, 0, marchStep);
//                break;
//            }
//            */
//
//            float globalDist = globalSceneSDF(tv.pos);
//            if (globalDist < EPSILON){
//                // hitWhich has now been set
//                totalFixMatrix = identityIsometry;
//                sampletv = tv;
//                //hitWhich = 5;
//                //debugColor = 0.1*vec3(globalDepth, 0, 0);
//                return;
//            }
//            marchStep = globalDist;
//            globalDepth += globalDist;
//            if (globalDepth >= localDepth){
//                //hitWhich = 5;
//                //debugColor = vec3(0, globalDepth, 0);
//                break;
//            }
//        }
//        /*
//        if(hitWhich == 0) {
//            hitWhich = 5;
//            debugColor = 0.1*vec3(0, 0, globalDepth);
//        }
//        */
//    }
//}


// variation on the raymarch algorithm
// now each step is the march is made from the previously achieved position (useful later for Sol).
// done with local vectors
float distToViewer;
int BINARY_SEARCH_STEPS=6;

void raymarch(localTangVector rayDir, out Isometry totalFixMatrix){

    Isometry fixMatrix;
    Isometry testFixMatrix;
    float marchStep = MIN_DIST;
    float testMarchStep = MIN_DIST;
    float globalDepth = MIN_DIST;
    float localDepth = MIN_DIST;
    localTangVector tv = rayDir;
    localTangVector localtv = rayDir;
    localTangVector testlocaltv = rayDir;
    localTangVector bestlocaltv = rayDir;
    totalFixMatrix = identityIsometry;
    // Trace the local scene, then the global scene:

    if (TILING_SCENE){
        
        
        
        for (int i = 0; i < MAX_MARCHING_STEPS; i++){
            float localDist = localSceneSDF(localtv.pos);
            
            
            if (localDist < EPSILON){
                  sampletv = toTangVector(localtv);
                distToViewer=globalDepth;
                  break;
              }
              marchStep = localDist;
            
            //localtv = flow(localtv, marchStep);

//            if (isOutsideCell(localtv, fixMatrix)){
//                totalFixMatrix = composeIsometry(fixMatrix, totalFixMatrix);
//                localtv = translate(fixMatrix, localtv);
//                localtv=tangNormalize(localtv);
//                marchStep = MIN_DIST;
//            }
            
        testlocaltv = flow(localtv, marchStep);
        if (isOutsideCell(testlocaltv, fixMatrix)){
            bestlocaltv = testlocaltv;
            
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
            totalFixMatrix = composeIsometry(fixMatrix, totalFixMatrix);
            localtv = translate(fixMatrix, localtv);
            localtv=tangNormalize(localtv);
            //globalDepth += marchStep; 
            marchStep = MIN_DIST;
      }
            
                  else{ 
          localtv = testlocaltv; 
          globalDepth += marchStep; 
        }
      }
      localDepth=min(globalDepth, MAX_DIST);
    }
    else{localDepth=MAX_DIST;}


            
//            else {
//                float localDist = min(.5, localSceneSDF(localtv.pos));
//                if (localDist < EPSILON){
//                    //hitWhich = 3;
//                    sampletv = toTangVector(localtv);
//                    break;
//                }
//                marchStep = localDist;
//                globalDepth += localDist;
//            }
//        }
//        localDepth = min(globalDepth, MAX_DIST);
//    }
//    else {
//        localDepth=MAX_DIST;
//    }


    if (GLOBAL_SCENE){
        globalDepth = MIN_DIST;
        marchStep = MIN_DIST;

        for (int i = 0; i < MAX_MARCHING_STEPS; i++){
            tv = flow(tv, marchStep);

            /*
            if (i == 15) {
                hitWhich = 5;
                debugColor = 10000. * vec3(0, 0, marchStep);
                break;
            }
            */

            float globalDist = globalSceneSDF(tv.pos);
            if (globalDist < EPSILON){
                // hitWhich has now been set
                distToViewer=globalDepth;
                totalFixMatrix = identityIsometry;
                sampletv = toTangVector(tv);
                //hitWhich = 5;
                //debugColor = 0.1*vec3(globalDepth, 0, 0);
                return;
            }
            marchStep = globalDist;
            globalDepth += globalDist;
            if (globalDepth >= localDepth){
                //hitWhich = 5;
                //debugColor = vec3(0, globalDepth, 0);
                break;
            }
        }
        /*
        if(hitWhich == 0) {
            hitWhich = 5;
            debugColor = 0.1*vec3(0, 0, globalDepth);
        }
        */
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


