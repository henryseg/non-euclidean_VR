

//new version for Euclidean Geometry


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
            
        testlocaltv = eucFlow(localtv, marchStep);
        if (isOutsideCell(testlocaltv, fixMatrix)){
            bestlocaltv = testlocaltv;
            
            for (int j = 0; j < BINARY_SEARCH_STEPS; j++){
              ////// do binary search to get close to but outside this cell - 
              ////// dont jump too far forwards, since localSDF can't see stuff in the next cube
              testMarchStep = marchStep - pow(0.5,float(j+1))*localDist;
              testlocaltv = eucFlow(localtv, testMarchStep);
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


    if (GLOBAL_SCENE){
        globalDepth = MIN_DIST;
        marchStep = MIN_DIST;

        for (int i = 0; i < MAX_MARCHING_STEPS; i++){
            tv = eucFlow(tv, marchStep);

            float globalDist = globalSceneSDF(tv.pos);
            if (globalDist < EPSILON){
                // hitWhich has now been set
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

    }
}



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
    // intialize the parameters of the elliptic integrals/functions
    //init_ellip(rayDir);
    // do the marching
    //raymarch(rayDir, totalFixMatrix);
    raymarch(toLocalTangVector(rayDir), totalFixMatrix);

    /*
    hitWhich = 5;

    float aux = ellipj(0.0001 * time * ell_K).x;
    if (aux > 0.){
        debugColor = vec3(aux, 0, 0);
    }
    else {
        debugColor = vec3(0, -aux, 0);
    }
    */


    //Based on hitWhich decide whether we hit a global object, local object, or nothing
    if (hitWhich == 0){ //Didn't hit anything ------------------------
        //COLOR THE FRAME DARK GRAY
        //0.2 is medium gray, 0 is black
        out_FragColor = vec4(0.3);
        return;
    }
    else if (hitWhich == 1){
        // lights
        vec3 pixelColor= lightColor(totalFixMatrix, sampletv, colorOfLight);
        out_FragColor=vec4(pixelColor, 1.0);
        return;
    }
    else if (hitWhich == 5){
        //debug
        out_FragColor = vec4(debugColor, 1.0);
        return;
    }
    else if (hitWhich == 2){
        // global object
        vec3 pixelColor= ballColor(totalFixMatrix, sampletv);
        out_FragColor=vec4(pixelColor, 1.0);
        return;
    }
    else if (hitWhich==3) {
        // local objects
        vec3 pixelColor= tilingColor(totalFixMatrix, sampletv);
        out_FragColor=vec4(pixelColor, 1.0);
        return;
    }

}