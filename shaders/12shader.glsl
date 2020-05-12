//----------------------------------------------------------------------------------------------------------------------
// DECIDING MATERIALS IN THE RAYMARCH
//----------------------------------------------------------------------------------------------------------------------


//do the raymarch, then depending on what you hit figure out the color:
vec4 marchedColor(int hitWhich, Isometry totalFixMatrix, tangVector sampletv){

    
     //Based on hitWhich decide whether we hit a global object, local object, or nothing
    if (hitWhich == 0){ //Didn't hit anything ------------------------
        //COLOR THE FRAME DARK GRAY
        //0.2 is medium gray, 0 is black
        return vec4(0.1);
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


// Deciding when a material is mirrored or not
bool isMirrored(int hitWhich){
       
     //Based on hitWhich decide whether we hit a global object, local object, or nothing
    if (hitWhich == 0){ //Didn't hit anything ------------------------
        return false;
    }
    else if (hitWhich == 1){
        // lights
        return false;
    }
    else if (hitWhich == 5){
        //debug
        return false;
    }
    else if (hitWhich == 2){
        // global object
        return true;

    }
    else if (hitWhich ==3) {
        // local objects
        return true;
    }
}
