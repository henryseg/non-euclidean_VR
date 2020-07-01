//--------------------------------------------------------------------
// Tangent Space Functions
//--------------------------------------------------------------------

Vector getRayPoint(vec2 resolution, vec2 fragCoord, bool isLeft){ //creates a tangent vector for our ray
    if (isStereo == 1){
        resolution.x = resolution.x * 0.5;
        if (!isLeft) { fragCoord.x = fragCoord.x - resolution.x; }
    }
    vec2 xy = 0.2*((fragCoord - 0.5*resolution)/resolution.x);
    float z = 0.1 / tan(radians(fov * 0.5));
    vec3 dir = vec3(xy, -z);
    Vector tv = createVector(ORIGIN, dir);
    Vector v =  tangNormalize(tv);
    return v;
}


//
//
//
//vec3 reflColor(int hitWhich){
//    
//     //Based on hitWhich decide whether we hit a global object, local object, or nothing
//    if (hitWhich == 0){ //Didn't hit anything ------------------------
//        //COLOR THE FRAME DARK GRAY
//        //0.2 is medium gray, 0 is black
//return vec3(0.05);
//    }
//    else if (hitWhich == 1){ // global lights
//        return globalLightColor.rgb;
//    }
//
//    else if (hitWhich == 2){ // global object
//        mat4 totalFixMatrix=mat4(1.);
//        return localColor(totalFixMatrix, sampletv);
//
//    }
//    else if (hitWhich == 7){ // the LOCAL earth
//     return sphereTexture(
//            totalFixMatrix, sampletv, earthCubeTex);
//
//    }
//    
//        else if (hitWhich == 8){ // the GLOBAL earth
//         return globalSphereTexture(
//            totalFixMatrix, sampletv, earthCubeTex);
//    }
//
//    
//    else { // the TILING
//    return globalColor(totalFixMatrix, sampletv);
//    }
//}
//
//
//
//


//--------------------------------------------------------------------
// Main
//--------------------------------------------------------------------

void main(){
    //vec4 rayOrigin = ORIGIN;

    //stereo translations ----------------------------------------------------
    bool isLeft = gl_FragCoord.x/screenResolution.x <= 0.5;
    Vector rayDir = getRayPoint(screenResolution, gl_FragCoord.xy, isLeft);

    //camera position must be translated in hyperboloid -----------------------
    rayDir = applyMatrixToDir(facing, rayDir);


    if (isStereo == 1){


        if (isLeft){
            rayDir = applyMatrixToDir(leftFacing, rayDir);
            Isometry leftshift = unserializeIsom(leftBoost);
            rayDir = translate(leftshift, rayDir);
        }
        else {
            rayDir = applyMatrixToDir(rightFacing, rayDir);
            Isometry rightshift = unserializeIsom(rightBoost);
            rayDir = translate(rightshift, rayDir);
        }
    }


    // in other geometries, the facing will not be an isom, so applying facing is probably not good.
    // rayDir = translate(facing, rayDir);
    Isometry shift = unserializeIsom(currentBoost);
    rayDir = translate(shift, rayDir);
    //generate direction then transform to hyperboloid ------------------------

    //    vec4 rayDirVPrime = tangDirection(rayOrigin, rayDirV);
    //get our raymarched distance back ------------------------
    Isometry totalFixIsom = identity;
    raymarch(rayDir, totalFixIsom);

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
        totalFixIsom = identity;
        vec3 pixelColor = localColor(totalFixIsom, sampletv);

        out_FragColor = vec4(pixelColor, 1.0);

        return;
    }

    else if (hitWhich == 8){ // the GLOBAL earth

        //earthBoostNow=composeIsometry(totalFixMatrix,earthBoostNow);
        // vec3 pixelColor=tilingColor(totalFixMatrix,sampletv);
        vec3 pixelColor=globalSphereTexture(totalFixIsom, sampletv, earthCubeTex);

        out_FragColor = vec4(pixelColor, 1.0);

        return;
    }


    //SHINY SURFACES


    else if (hitWhich == 7){ // the LOCAL earth


        //earthBoostNow=composeIsometry(totalFixMatrix,earthBoostNow);
        // vec3 pixelColor=tilingColor(totalFixMatrix,sampletv);
        vec3 pixelColor=sphereTexture(totalFixIsom, sampletv, earthCubeTex);


        //now: do another pass!
        //save data from the first pass

        float origDistToViewer=distToViewer;//this is set by raymarch, along with sampletv
        Vector toViewer=turnAround(sampletv);//tangent vector on surface pointing to viewer
        Vector surfNormal=estimateNormal(sampletv.pos);//normal vector to surface

        //this means...we do the raymarch again! starting from this position (sampletv)
        //first, reflect this direction wtih respect to the surface normal
        Vector newDir = reflectOff(sampletv, surfNormal);
        //move the new ray off a little bit
        newDir=flow(newDir, 0.01);
        //then, raymarch in this new direction

        //the raymarcher reflectmarch is built to allow some corner-cutting for speed
        //but, you can also run raymarch here directly
        raymarch(newDir, totalFixIsom);
        //this has reset values like distToViewer (why we had to save the old one above), and sampletv to reflect the new positions

        vec3 reflColor;




        if (hitWhich == 0){ //Didn't hit anything ------------------------
            //COLOR THE FRAME DARK GRAY
            //0.2 is medium gray, 0 is black
            reflColor=vec3(0.05);
        }
        else if (hitWhich == 1){ // global lights
            reflColor=globalLightColor.rgb;
        }

        else if (hitWhich == 2){ // global object
            mat4 totalFixMatrix=mat4(1.);
            reflColor=localColor(totalFixMatrix, sampletv);

        }
        else if (hitWhich == 7){ // the LOCAL earth
            reflColor=sphereTexture(
            totalFixIsom, sampletv, earthCubeTex);

        }

        else if (hitWhich == 8){ // the GLOBAL earth
            reflColor=globalSphereTexture(
            totalFixIsom, sampletv, earthCubeTex);
        }


        else { // the TILING
            reflColor=tilingColor(totalFixIsom, sampletv);
        }



        vec3 totalColor=0.85*pixelColor+0.15*reflColor;

        //add in fog
        totalColor=fog(totalColor, vec3(0.02, 0.02, 0.02), origDistToViewer);

        out_FragColor=vec4(totalColor, 1.0);




        return;
    }


    else { // the TILING


        //this is the lighting from the FIRST PASS
        vec3 pixelColor= tilingColor(totalFixIsom, sampletv);


        out_FragColor=pow(vec4(pixelColor, 1.), vec4(0.8));
        //out_FragColor=vec4(debugColor, 1.0);

        //COMMENT ALL OF THE BELOW TO GET RID OF REFLECTIONS

        //       //now: do another pass!
        //        //save data from the first pass
        //    vec4 surfacePosition=sampletv.pos;//position on the surface of the sample point, set by raymarch
        //    float origDistToViewer=distToViewer;//this is set by raymarch, along with sampletv
        //    Vector toViewer=turnAround(sampletv);//tangent vector on surface pointing to viewer
        //    tangVector surfNormal=estimateNormal(sampletv.pos);//normal vector to surface
        //
        //        //this means...we do the raymarch again! starting from this position (sampletv)
        //    //first, reflect this direction wtih respect to the surface normal
        //    tangVector newDir = reflectOff(sampletv, surfNormal);
        //    //move the new ray off a little bit
        //    newDir=flow(newDir,0.01);
        //    //then, raymarch in this new direction
        //
        //    //the raymarcher reflectmarch is built to allow some corner-cutting for speed
        //    //but, you can also run raymarch here directly
        //    reflectmarch(newDir, totalFixMatrix);
        //    //this has reset values like distToViewer (why we had to save the old one above), and sampletv to reflect the new positions
        //
        //
        //
        //
        //        vec3 reflColor;
        //
        //
        //
        //
        //        if (hitWhich == 0){ //Didn't hit anything ------------------------
        //        //COLOR THE FRAME DARK GRAY
        //        //0.2 is medium gray, 0 is black
        //reflColor=vec3(0.05);
        //    }
        //    else if (hitWhich == 1){ // global lights
        //    reflColor=globalLightColor.rgb;
        //    }
        //
        //    else if (hitWhich == 2){ // global object
        //        mat4 totalFixMatrix=mat4(1.);
        //        reflColor=localColor(totalFixMatrix, sampletv);
        //
        //    }
        //    else if (hitWhich == 7){ // the LOCAL earth
        //     reflColor=sphereTexture(
        //            totalFixMatrix, sampletv, earthCubeTex);
        //
        //    }
        //
        //        else if (hitWhich == 8){ // the GLOBAL earth
        //         reflColor=globalSphereTexture(
        //            totalFixMatrix, sampletv, earthCubeTex);
        //    }
        //
        //
        //    else { // the TILING
        //    reflColor=tilingColor(totalFixMatrix, sampletv);
        //    }
        //
        //
        //
        //    vec3 totalColor=  0.8*pixelColor+0.2*reflColor;
        //
        //
        //
        //    //add in fog
        //    totalColor=fog(totalColor,vec3(0.02,0.02,0.02),origDistToViewer);
        //
        //
        //        //uncomment the a bove and switch back to pixelColor to get the reflections
        //
        //
        //    out_FragColor=pow(vec4(totalColor,1.),vec4(0.8));
        //        //vec4(pixelColor, 1.0);

    }

}