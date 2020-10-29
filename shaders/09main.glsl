

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
    init_ellip(rayDir);
    // do the marching
    //raymarch(rayDir, totalFixMatrix);
    raymarchDirect(toLocalTangVector(rayDir), totalFixMatrix);
    
    float origDistToViewer=distToViewer;//this is set by raymarch, along with sampletv

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
        out_FragColor = vec4(0.02);
        return;
    }
    else if (hitWhich == 1){
        // global lights
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
     pixelColor=fog(pixelColor,vec3(0.02,0.02,0.02),origDistToViewer);
    out_FragColor=vec4(pixelColor, 1.0);
        return;
    }
    
    
    
    
      
  // ------- SHINY THINGS ---------  
    
    
    
    

//    
    
    
    
    
    
    
    else if (hitWhich==3) {
        // local objects
        vec3 pixelColor= tilingColor(totalFixMatrix, sampletv);
     //   out_FragColor=vec4(pixelColor, 1.0);
        
        
        
        if(origDistToViewer>2.){
                //add in fog
    pixelColor=fog(pixelColor,vec3(0.02,0.02,0.02),origDistToViewer);

    out_FragColor=vec4(pixelColor, 1.0);
            return;

        
        }
        else{
        
        //----uncomment below for reflections
      
        //now: do another pass!
        //save data from the first pass
    
    
    tangVector toViewer=turnAround(sampletv);//tangent vector on surface pointing to viewer
    tangVector surfNormal=estimateNormal(sampletv.pos);//normal vector to surface
        
        //this means...we do the raymarch again! starting from this position (sampletv)
    //first, reflect this direction wtih respect to the surface normal
    tangVector newDir = reflectOff(sampletv, surfNormal);
    //move the new ray off a little bit
        
        
        
        
    newDir=flow(newDir,0.1);
    //then, raymarch in this new direction

    //the raymarcher reflectmarch is built to allow some corner-cutting for speed
    //but, you can also run raymarch here directly
    raymarchDirect(toLocalTangVector(newDir), totalFixMatrix);
    //this has reset values like distToViewer (why we had to save the old one above), and sampletv to reflect the new positions
        
    vec3 reflColor;
        
        
        
        
          if (hitWhich == 0){ //Didn't hit anything ------------------------
        //COLOR THE FRAME DARK GRAY
        //0.2 is medium gray, 0 is black
        out_FragColor = vec4(0.02);
        return;
    }
    else if (hitWhich == 1){
        // global lights
        vec3 pixelColor= lightColor(totalFixMatrix, sampletv, colorOfLight);
        out_FragColor=vec4(pixelColor, 1.0);
        return;
    }

    else if (hitWhich == 2){
        // global object
        vec3 pixelColor= ballColor(totalFixMatrix, sampletv);
        out_FragColor=vec4(pixelColor, 1.0);
        return;
    }
    
    else { // the TILING
    reflColor=tilingColor(totalFixMatrix, sampletv);
    } 
        
        
        
    vec3 totalColor=0.8*pixelColor+0.2*reflColor;
    
    //add in fog
    totalColor=fog(totalColor,vec3(0.02,0.02,0.02),origDistToViewer);

    out_FragColor=vec4(totalColor, 1.0);




        return;  
        
        
        
        
        
        
        
        
        }
        
        
        
        
    }

  
    
    
    
}