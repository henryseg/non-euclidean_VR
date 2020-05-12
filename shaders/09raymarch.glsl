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

// each step is the march is made from the previously achieved position,
// in contrast to starting over from currentPosition each time, and just tracing a longer distance.
//this is helpful in sol - but might lead to more errors accumulating when done in hyperbolic for example?




void raymarch(tangVector rayDir, out Isometry totalFixMatrix){
    Isometry fixMatrix;
    float marchStep = MIN_DIST;
    float globalDepth = MIN_DIST;
    float localDepth = MIN_DIST;
    distToViewer=MAX_DIST;
    
    tangVector localtv = rayDir;
    tangVector globaltv = rayDir;
    
    totalFixMatrix = identityIsometry;


    //before you start the march, step out by START_MARCH to make the bubble around your head
    localtv=geoFlow(localtv,START_MARCH);
    globaltv=geoFlow(globaltv,START_MARCH);
    
    
// Trace the local scene, then the global scene:
    if(TILING_SCENE){
    marchStep = MIN_DIST;
        
    for (int i = 0; i < MAX_MARCHING_STEPS; i++){
        
        //flow along the geodesic from your current position by the amount march step allows
        localtv = geoFlow(localtv, marchStep);

        if (isOutsideCell(localtv, fixMatrix)){
            //if you are outside of the central cell after the march done above
            //then translate yourself back into the central cell and set the next marching distance to a minimum
            totalFixMatrix = composeIsometry(fixMatrix, totalFixMatrix);
            localtv = translate(fixMatrix, localtv);
            marchStep = MIN_DIST;
        }
        
        else {//if you are still inside the central cell
            //find the distance to the local scene
            float localDist = localSceneSDF(localtv.pos);
            
            if (localDist < EPSILON||localDist>MAX_DIST){//if you hit something, or left the range completely
                distToViewer=localDepth;//set the total distance marched
                sampletv = localtv;//give the point reached
                break;
            }
            //if its not less than epsilon, add to the  distance and march ahead by that amunt
            marchStep = marchProportion*localDist;//make this distance your next march step
            localDepth += marchStep;//add this to the total distance traced so far

        }
    }
        //set the local depth (how far you marched total in the local scene)
        //for use in marching the global scene below
    localDepth=min(localDepth, MAX_DIST);
    }
    else{localDepth=MAX_DIST;}//if you didn't march the tiling scene at all, then set this distance to max to make sure we see whatever is in the global scene when we trace it next.


    if(GLOBAL_SCENE){
    marchStep = MIN_DIST;
        
    for (int i = 0; i < MAX_MARCHING_STEPS; i++){
        globaltv = geoFlow(globaltv, marchStep);

        float globalDist = globalSceneSDF(globaltv.pos);
         
        if (globalDist < EPSILON||globalDist>MAX_DIST){
            // hitWhich has now been set
            totalFixMatrix = identityIsometry;//we are not in the local scene, so have no fix matrix
            distToViewer=globalDepth;//set the total distance marched
            sampletv = globaltv;//give the point reached
            return; 
        }
        //if not, add this to  your total distance traveled and march ahead by this amount 
         marchStep = marchProportion*globalDist;//make this distance your next march step
        globalDepth += marchProportion*globalDist;//add this to the total distance traced so far
      
        if (globalDepth >= localDepth){
            //if you have marched farther than you did in the local scene, the global object is behind something already, so stop.
            break;
        }
    }
    }
}







//--------------------------------------------
// RAYMARCHING A REFLECTION
//--------------------------------------------

//a cheaper variation on the raymarch for use in reflections.
//only runs on the local scene, and does so with less resolution, by only running MAX_REFL_MARCH number of times, and 
//only traveling out MAX_REFL_DIST amount of time whiel also having a more generous threshhold than the standard epsilon
//
void reflectmarch(tangVector rayDir, out Isometry totalFixMatrix){
    Isometry fixMatrix;
    totalFixMatrix = identityIsometry;
    
    float marchStep = MIN_DIST;
    float globalDepth = MIN_DIST;
    float localDepth = MIN_DIST;
    distToViewer=MAX_REFL_DIST;
    
    tangVector localtv = rayDir;
    float newEp = EPSILON * 10.0;
    
// Trace the local scene, then the global scene:
    if(TILING_SCENE){
        
    for (int i = 0; i < MAX_REFL_STEPS; i++){
        localtv = geoFlow(localtv, marchStep);

        if (isOutsideCell(localtv, fixMatrix)){
            //if you are outside of the central cell after the march done above
            //then translate yourself back into the central cell and set the next marching distance to a minimum
            totalFixMatrix = composeIsometry(fixMatrix, totalFixMatrix);
            localtv = translate(fixMatrix, localtv);
            marchStep = MIN_DIST;
        }
        
        else {//if you are still inside the central cell
            //set the local distance to a portion of the sceneSDF
            float localDist = localSceneSDF(localtv.pos,newEp);
            
            if (localDist < newEp||localDist>MAX_REFL_DIST){//if you hit something
                //setting epsilon like this might not trigger the global scene SDF to set hitWhich now though....
                distToViewer=localDepth;//set the total distance marched
                sampletv = localtv;//give the point reached
                return;
            }
            marchStep = 0.9*localDist;//make this distance your next march step
            localDepth += 0.9*localDist;//add this to the total distance traced so far

        }
    }
        
    }
}











//
//
//void oldmarch(tangVector rayDir, out Isometry totalFixMatrix){
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
//
//    if(TILING_SCENE){
//    for (int i = 0; i < MAX_MARCHING_STEPS; i++){
//        localtv = geoFlow(localtv, marchStep);
//
//        if (isOutsideCell(localtv, fixMatrix)){
//            totalFixMatrix = composeIsometry(fixMatrix, totalFixMatrix);
//            localtv = translate(fixMatrix, localtv);
//            marchStep = MIN_DIST;
//        }
//        else {
//            float localDist = localSceneSDF(localtv.pos);
//                        marchStep = localDist;
//            globalDepth += 0.9*localDist;
//            if (localDist < EPSILON){
//                hitWhich = 3;
//                distToViewer=globalDepth;
//                sampletv = localtv;
//                break;
//            }
//
//        }
//    }
//    localDepth=min(globalDepth, MAX_DIST);
//    }
//    else{localDepth=MAX_DIST;}
//
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
//            sampletv = tv;
//            return;
//        }
//      
//        if (globalDepth >= localDepth){
//            break;
//        }
//    }
//    }
//}





















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




