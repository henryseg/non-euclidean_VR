
//--------------------------------------------
// DOING THE RAYMARCH
//--------------------------------------------


// variation on the raymarch algorithm
// now each step is the march is made from the previously achieved position (useful later for Sol).



void raymarch(localTangVector rayDir, out Isometry totalFixMatrix){
    Isometry fixMatrix;
    float marchStep = MIN_DIST;
    float globalDepth = MIN_DIST;
    float localDepth = MIN_DIST;
    localTangVector tv = rayDir;
    localTangVector localtv = rayDir;
    totalFixMatrix = identityIsometry;


    // Trace the local scene, then the global scene:


    if(TILING_SCENE){
    for (int i = 0; i < MAX_MARCHING_STEPS; i++){
        localtv = eucFlow(localtv, marchStep);

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
        tv = eucFlow(tv, marchStep);

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









//do the raymarch, then depending on what you hit figure out the color:
vec4 marchedColor(int hitWhich, Isometry totalFixMatrix, tangVector sampletv){

    
     //Based on hitWhich decide whether we hit a global object, local object, or nothing
    if (hitWhich == 0){ //Didn't hit anything ------------------------
        //COLOR THE FRAME DARK GRAY
        //0.2 is medium gray, 0 is black
        return vec4(0.2);
    }
    else if (hitWhich == 1){
        // lights
        vec3 pixelColor= lightColor(totalFixMatrix, sampletv, colorOfLight);
        return vec4(pixelColor, 1.0);
    }
    else if (hitWhich == 5){
        //debug
        return vec4(debugColor, 1.0);
    }
    else if (hitWhich == 2){
        // global object
        vec3 pixelColor= ballColor(totalFixMatrix, sampletv);
        return vec4(pixelColor, 1.0);

    }
    else if (hitWhich ==3) {
        // local objects
        //vec3 pixelColor=vec3(20.*distToViewer/MAX_DIST,0.,0.);
        vec3 pixelColor= tilingColor(totalFixMatrix, sampletv);
        return vec4(pixelColor, 1.0);

    }

    
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
//        testlocaltv = eucFlow(localtv, marchStep);
//        if (isOutsideCell(testlocaltv, fixMatrix)){
//            bestlocaltv = testlocaltv;
//            
//            for (int j = 0; j < BINARY_SEARCH_STEPS; j++){
//              ////// do binary search to get close to but outside this cell - 
//              ////// dont jump too far forwards, since localSDF can't see stuff in the next cube
//              testMarchStep = marchStep - pow(0.5,float(j+1))*localDist;
//              testlocaltv = eucFlow(localtv, testMarchStep);
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
//            tv = eucFlow(tv, marchStep);
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

//----------------------------------------------------------------------------------------------------------------------
// Main
//----------------------------------------------------------------------------------------------------------------------

void main(){
    setResolution(res);
    currentBoost=Isometry(currentBoostMat);
    leftBoost=Isometry(leftBoostMat);
    rightBoost=Isometry(rightBoostMat);
    cellBoost=Isometry(cellBoostMat);
    invCellBoost=Isometry(invCellBoostMat);
    globalObjectBoost=Isometry(globalObjectBoostMat);


    //stereo translations ----------------------------------------------------
    bool isLeft = gl_FragCoord.x/screenResolution.x <= 0.5;
    tangVector rayDir = getRayPoint(screenResolution, gl_FragCoord.xy, isLeft);

    if (isStereo == 1){
        if (isLeft){
            rayDir = rotateFacing(leftFacing, rayDir);
            rayDir = translate(leftBoost, rayDir);
        }
        else {
            rayDir = rotateFacing(rightFacing, rayDir);
            rayDir = translate(rightBoost, rayDir);
        }
    }
    else {
        rayDir = rotateFacing(facing, rayDir);
        rayDir = translate(currentBoost, rayDir);
    }

    
    
    
    
    
    
    

    
    //get our raymarched distance back ------------------------
    Isometry totalFixMatrix = identityIsometry;
  
    
    //do the  raymarch    
    raymarch(toLocalTangVector(rayDir), totalFixMatrix);
    
    //figuring out the color of the point we marched to
    vec4 resultingColor;
    resultingColor=marchedColor(hitWhich,totalFixMatrix,sampletv);
    
    //output this color
    //out_FragColor=resultingColor;
    
    
    
    
    
    
    //TRY REFLECTIONS!! ------------------------
    
    //have a uniform float mirror that says how shiny the surface is:
     
    if(mirror==0.){//don't do a second round
        out_FragColor=resultingColor;
        return;
    }
    
    else{
    
    //do the raymarch again! starting from this position (sampletv)
    //first, reflect this direction wtih respect to the surface normal
    tangVector nVec=estimateNormal(sampletv.pos);
    tangVector newDir = sub(scalarMult(-2.0 * cosAng(sampletv, nVec), nVec), sampletv);
    
    
    
    //randomly adjust the direction by a TINY ammount to simulate slight  roughness in the surface
//    float n = sin(dot(newDir.pos, vec4(27, 113, 57,0.)));
//    vec4 rnd = fract(vec4(2097152, 262144, 32768,0.)*n)*.16 - .08;
//    newDir.dir=newDir.dir+0.05*rnd;
    
    //move the new ray off a little bit
    newDir.pos=newDir.pos+0.01*newDir.dir;
    //then, raymarch in this new direction
    raymarch(toLocalTangVector(newDir), totalFixMatrix);
    
    //now, get the reflected color
    vec4 reflectedColor;
    reflectedColor=marchedColor(hitWhich,totalFixMatrix,sampletv);
    
    //now combine the first pass color and the  reflected color to output
    out_FragColor=0.2*resultingColor+0.8*((1.-mirror)*resultingColor+mirror* reflectedColor);
    
    }
    
    
    
    
    
//    //Run Reflections a Third Time!! ------------------------
//    
//    //do the raymarch again! starting from this position (sampletv)
//    //first, reflect this direction wtih respect to the surface normal
//    nVec=estimateNormal(sampletv.pos);
//    newDir = sub(scalarMult(-2.0 * cosAng(sampletv, nVec), nVec), sampletv);
//    
//    //move the new ray off a little bit
//    newDir.pos=newDir.pos+0.01*newDir.dir;
//    //then, raymarch in this new direction
//    raymarch(toLocalTangVector(newDir), totalFixMatrix);
//    
//    //now, get the reflected color
//    vec4 reflectedColor2;
//    reflectedColor2=marchedColor(hitWhich,totalFixMatrix,sampletv);
//    
//    //now combine the first pass color and the  reflected color to output
//    out_FragColor=resultingColor+0.25*reflectedColor+0.1*reflectedColor2;



}