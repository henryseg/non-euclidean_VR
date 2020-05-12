//----------------------------------------------------------------------------------------------------------------------
// Tangent Space Functions
//----------------------------------------------------------------------------------------------------------------------

tangVector getRayPoint(vec2 resolution, vec2 fragCoord, bool isLeft){ //creates a tangent vector for our ray
    if (isStereo == 1){
        resolution.x = resolution.x * 0.5;
        if (!isLeft) { fragCoord.x = fragCoord.x - resolution.x; }
    }
    vec2 xy = 0.2*((fragCoord - 0.5*resolution)/resolution.x);
    float z = 0.1/tan(radians(fov*0.5));
    tangVector tv = tangVector(ORIGIN, vec4(xy, -z, 0.0));
    tangVector v =  tangNormalize(tv);
    return v;
}





    //stereo translations ----------------------------------------------------
tangVector setRayDir(){
    bool isLeft = gl_FragCoord.x/screenResolution.x <= 0.5;
    tangVector rD = getRayPoint(screenResolution, gl_FragCoord.xy, isLeft);

    if (isStereo == 1){
        if (isLeft){
            rD = rotateFacing(leftFacing, rD);
            rD = translate(leftBoost, rD);
        }
        else {
            rD = rotateFacing(rightFacing, rD);
            rD = translate(rightBoost, rD);
        }
    }
    else {
        rD = rotateFacing(facing, rD);
        rD = translate(currentBoost, rD);
    }
    return rD;
}
    
    







//--------------------------------------------
// DOING THE RAYMARCH
//--------------------------------------------


// variation on the raymarch algorithm
// now each step is the march is made from the previously achieved position (useful later for Sol).


//make it  so there's a bubble around your head
float START_MARCH=0.2;

void raymarch(localTangVector rayDir, out Isometry totalFixMatrix){
    Isometry fixMatrix;
    float marchStep = MIN_DIST;
    float globalDepth = MIN_DIST;
    float localDepth = MIN_DIST;
    localTangVector tv = rayDir;
    localTangVector localtv = rayDir;
    totalFixMatrix = identityIsometry;


    //before you start the march, step out by START_MARCH to make the bubble around your head
    localtv=geoFlow(localtv,START_MARCH);
    
    
// Trace the local scene, then the global scene:
    if(TILING_SCENE){
    for (int i = 0; i < MAX_MARCHING_STEPS; i++){
        localtv = geoFlow(localtv, marchStep);

        if (isOutsideCell(localtv, fixMatrix)){
            totalFixMatrix = composeIsometry(fixMatrix, totalFixMatrix);
            localtv = translate(fixMatrix, localtv);
            marchStep = MIN_DIST;
        }
        else {
            float localDist = 0.75*localSceneSDF(localtv.pos);
                        marchStep = localDist;
            globalDepth += localDist;
            if (localDist < EPSILON){
                hitWhich = 3;
                distToViewer=globalDepth;
                sampletv = toTangVector(localtv);
                break;
            }

        }
    }
    localDepth=min(globalDepth, MAX_DIST);
    }
    else{localDepth=MAX_DIST;}


    if(GLOBAL_SCENE){
    globalDepth = MIN_DIST;
    marchStep = MIN_DIST;
    for (int i = 0; i < MAX_MARCHING_STEPS; i++){
        tv = geoFlow(tv, marchStep);

        float globalDist = globalSceneSDF(tv.pos);
          marchStep = globalDist;
        globalDepth += globalDist;
        if (globalDist < EPSILON){
            // hitWhich has now been set
            totalFixMatrix = identityIsometry;
            distToViewer=globalDepth;
            sampletv = toTangVector(tv);
            return;
        }
      
        if (globalDepth >= localDepth){
            break;
        }
    }
    }
}


void reflectmarch(localTangVector rayDir, out Isometry totalFixMatrix){
    Isometry fixMatrix;
    float marchStep = MIN_DIST;
    float globalDepth = MIN_DIST;
    float localDepth = MIN_DIST;
    localTangVector tv = rayDir;
    localTangVector localtv = rayDir;
    totalFixMatrix = identityIsometry;


    // Trace the local scene, then the global scene:


    if(TILING_SCENE){
    for (int i = 0; i < MAX_REFL_STEPS; i++){
        localtv = geoFlow(localtv, marchStep);

        if (isOutsideCell(localtv, fixMatrix)){
            totalFixMatrix = composeIsometry(fixMatrix, totalFixMatrix);
            localtv = translate(fixMatrix, localtv);
            marchStep = MIN_DIST;
        }
        else {
            float localDist = localSceneSDF(localtv.pos);
                        marchStep = localDist;
            globalDepth += 0.9*localDist;
            if (localDist < EPSILON){
                hitWhich = 3;
                distToViewer=globalDepth;
                sampletv = toTangVector(localtv);
                break;
            }

        }
    }
    localDepth=min(globalDepth, MAX_DIST);
    }
    else{localDepth=MAX_DIST;}

//
//    if(GLOBAL_SCENE){
//    globalDepth = MIN_DIST;
//    marchStep = MIN_DIST;
//    for (int i = 0; i < MAX_MARCHING_STEPS; i++){
//        tv = geoFlow(tv, marchStep);
//
//        float globalDist = globalSceneSDF(tv.pos);
//          marchStep = globalDist;
//        globalDepth += globalDist;
//        if (globalDist < EPSILON){
//            // hitWhich has now been set
//            totalFixMatrix = identityIsometry;
//            distToViewer=globalDepth;
//            sampletv = toTangVector(tv);
//            return;
//        }
//      
//        if (globalDepth >= localDepth){
//            break;
//        }
//    }
//    }
}





















//
//
//
//
//
//
//
////new version for Euclidean Geometry
//
//
//int BINARY_SEARCH_STEPS=20;
//
//void raymarch(localTangVector rayDir, out Isometry totalFixMatrix){
//
//    Isometry fixMatrix;
//    Isometry testFixMatrix;
//    float marchStep = MIN_DIST;
//    float testMarchStep = MIN_DIST;
//    float globalDepth = MIN_DIST;
//    float localDepth = MIN_DIST;
//    localTangVector tv = rayDir;
//    localTangVector localtv = rayDir;
//    localTangVector testlocaltv = rayDir;
//    localTangVector bestlocaltv = rayDir;
//    totalFixMatrix = identityIsometry;
//    // Trace the local scene, then the global scene:
//
//    if (TILING_SCENE){
//        
//        
//        
//        for (int i = 0; i < MAX_MARCHING_STEPS; i++){
//            float localDist = localSceneSDF(localtv.pos);
//            
//            
//            if (localDist < EPSILON){
//                sampletv = toTangVector(localtv);
//                distToViewer=globalDepth;
//                  break;
//              }
//              marchStep = localDist;
//            
//            //localtv = flow(localtv, marchStep);
//
////            if (isOutsideCell(localtv, fixMatrix)){
////                totalFixMatrix = composeIsometry(fixMatrix, totalFixMatrix);
////                localtv = translate(fixMatrix, localtv);
////                localtv=tangNormalize(localtv);
////                marchStep = MIN_DIST;
////            }
//            
//        testlocaltv = geoFlow(localtv, marchStep);
//        if (isOutsideCell(testlocaltv, fixMatrix)){
//            bestlocaltv = testlocaltv;
//            
//            for (int j = 0; j < BINARY_SEARCH_STEPS; j++){
//              ////// do binary search to get close to but outside this cell - 
//              ////// dont jump too far forwards, since localSDF can't see stuff in the next cube
//              testMarchStep = marchStep - pow(0.5,float(j+1))*localDist;
//              testlocaltv = geoFlow(localtv, testMarchStep);
//              if ( isOutsideCell(testlocaltv, testFixMatrix) ){
//                marchStep = testMarchStep;
//                bestlocaltv = testlocaltv;
//                fixMatrix = testFixMatrix;
//              }
//            }
//            
//            localtv = bestlocaltv;
//            totalFixMatrix = composeIsometry(fixMatrix, totalFixMatrix);
//            localtv = translate(fixMatrix, localtv);
//            localtv=tangNormalize(localtv);
//            //globalDepth += marchStep; 
//            marchStep = MIN_DIST;
//      }
//            
//                  else{ 
//          localtv = testlocaltv; 
//          globalDepth += marchStep; 
//        }
//      }
//      localDepth=min(globalDepth, MAX_DIST);
//    }
//    else{localDepth=MAX_DIST;}
//
//
//    if (GLOBAL_SCENE){
//        globalDepth = MIN_DIST;
//        marchStep = MIN_DIST;
//
//        for (int i = 0; i < MAX_MARCHING_STEPS; i++){
//            tv = geoFlow(tv, marchStep);
//
//            float globalDist = globalSceneSDF(tv.pos);
//            if (globalDist < EPSILON){
//                // hitWhich has now been set
//                totalFixMatrix = identityIsometry;
//                sampletv = toTangVector(tv);
//                distToViewer=globalDepth;
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
//
//    }
//}
//
//








//NORMAL FUNCTIONS ++++++++++++++++++++++++++++++++++++++++++++++++++++
//Given a point in the scene where you stop raymarching as you have hit a surface, find the normal at that point
tangVector estimateNormal(vec4 p) { 
    float newEp = EPSILON * 10.0;
    //basis for the tangent space at that point.
    mat4 theBasis= tangBasis(p);
    vec4 basis_x = theBasis[0];
    vec4 basis_y = theBasis[1];
    vec4 basis_z = theBasis[2];
    
    if (hitWhich != 3){ //global light scene
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




