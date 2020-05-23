//--------------------------------------------------------------------
// Tangent Space Functions
//--------------------------------------------------------------------

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

//--------------------------------------------------------------------
// Main
//--------------------------------------------------------------------

void main(){
    //vec4 rayOrigin = ORIGIN;

    //stereo translations ----------------------------------------------------
    bool isLeft = gl_FragCoord.x/screenResolution.x <= 0.5;
    tangVector rayDir = getRayPoint(screenResolution, gl_FragCoord.xy, isLeft);

    //camera position must be translated in hyperboloid -----------------------
    rayDir=applyMatrixToDir(facing, rayDir);


    if (isStereo == 1){


        if (isLeft){
            rayDir=applyMatrixToDir(leftFacing, rayDir);
            rayDir = translate(leftBoost, rayDir);
        }
        else {
            rayDir=applyMatrixToDir(rightFacing, rayDir);
            rayDir = translate(rightBoost, rayDir);
        }
    }


    // in other geometries, the facing will not be an isom, so applying facing is probably not good.
    // rayDir = translate(facing, rayDir);
    rayDir = translate(currentBoost, rayDir);
    //generate direction then transform to hyperboloid ------------------------

    //    vec4 rayDirVPrime = tangDirection(rayOrigin, rayDirV);
    //get our raymarched distance back ------------------------
    mat4 totalFixMatrix = mat4(1.0);
    raymarch(rayDir, totalFixMatrix);

    //Based on hitWhich decide whether we hit a global object, local object, or nothing
    if (hitWhich == 0){ //Didn't hit anything ------------------------
        //COLOR THE FRAME DARK GRAY
        //0.2 is medium gray, 0 is black
        out_FragColor = vec4(0.05);
        return;
    }
    else if (hitWhich == 1){ // global lights
        out_FragColor = vec4(globalLightColor.rgb, 1.0);
        return;
    }
    else if (hitWhich == 5){ //debug
        out_FragColor = vec4(debugColor, 1.0);
    }

    else if (hitWhich == 2){ // global object

        vec3 pixelColor=localColor(totalFixMatrix, sampletv);

        out_FragColor = vec4(pixelColor, 1.0);

        return;
    }
    else if (hitWhich == 7){ // the LOCAL earth
        
    //earthBoostNow=composeIsometry(totalFixMatrix,earthBoostNow);
   // vec3 pixelColor=tilingColor(totalFixMatrix,sampletv);
        vec3 pixelColor=sphereTexture(
            totalFixMatrix, sampletv, earthCubeTex);

       out_FragColor = vec4( pixelColor,1.0);

        return;
    }
    
        else if (hitWhich == 8){ // the GLOBAL earth
        
    //earthBoostNow=composeIsometry(totalFixMatrix,earthBoostNow);
   // vec3 pixelColor=tilingColor(totalFixMatrix,sampletv);
        vec3 pixelColor=globalSphereTexture(
            totalFixMatrix, sampletv, earthCubeTex);

       out_FragColor = vec4( pixelColor,1.0);

        return;
    }

    else { // objects

        vec3 pixelColor= globalColor(totalFixMatrix, sampletv);

        out_FragColor=vec4(pixelColor, 1.0);

    }

}