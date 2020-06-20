


//----------------------------------------------------------------------------------------------------------------------
// All Local Lights
//----------------------------------------------------------------------------------------------------------------------


//this uses the lighting functions in "lighting" to build the local lighting function for our particular scene;
//that is, with however many local lights, their positions, etc that we have specified.

vec3 allLocalLights(vec3 surfColor,bool marchShadows, Isometry fixPosition){
    //only have one global light in the scene right now,
    
    return localLight(localLightPos, localLightColor, 5.+6.*brightness*brightness,marchShadows, surfColor,fixPosition);
}







//----------------------------------------------------------------------------------------------------------------------
// All Global Lights
//----------------------------------------------------------------------------------------------------------------------


//this uses the lighting functions in "lighting" to build the global lighting function for our particular scene;
//that is, with however many global lights, their positions, etc that we have specified.




vec3 allGlobalLights(vec3 surfColor,bool marchShadows,Isometry fixPosition){
    
    vec3 globalColor=vec3(0.);
    
     for (int i=0; i<4; i++){
         //have four global lights in our scene
         
         globalColor+=globalLight(lightPositions[i], lightIntensities[i].xyz, 4.,marchShadows, surfColor,fixPosition);
     }
    
    //normalize the output color by dividing by the number of light sources
    return globalColor/4.;
}

















//----------------------------------------------------------------------------------------------------------------------
// First Pass Color
//----------------------------------------------------------------------------------------------------------------------

//this function takes in a rayDir, thought of as the viewer's viewpoint direction, and figures out the color at the end of the raymarch

//used in the pixelColor shader at the end, to keep track of what objects we have hit
//vec3 surfColor;
//float surfReflectivity;


vec3 marchedColor(tangVector rayDir,bool firstPass, out float surfRefl){
    
    bool marchShadows;
    Isometry fixPosition;
    
    vec3 baseColor;//color of the surface where it is struck
    
    vec3 localColor;//the total lighting  computation from local lights
    vec3 globalColor;//the total lighting  computation from global lights
    vec3 totalColor;// the  total lighting computation from all sources
       
    //tangVector toViewer;
    //vec4 surfacePosition;
    
    
    
    //------ DOING THE RAYMARCH ----------
    
   if(firstPass){
    raymarch(rayDir,totalFixMatrix);//do the  raymarch    
   }
    else{//on reflection passes, do the cheaper march
        reflectmarch(rayDir,totalFixMatrix);
        }
    
    //------ Basic Surface Properties ----------
    //we need these quantities to run the local / global lighting functions
    baseColor=materialColor(hitWhich);
    surfRefl=materialReflectivity(hitWhich);
    surfacePosition=sampletv.pos;//position on the surface of the sample point, set by raymarch
    toViewer=turnAround(sampletv);//tangent vector on surface pointing to viewer / origin of raymarch
    surfNormal=surfaceNormal(sampletv);//normal vector to surface
    
    //------ Lighting Properties ----------
    marchShadows=firstPass&&renderShadow;//only draw shadows when its first pass & instructed by uniform
    
    //------ Local Lighting ----------
    //fixPosition=identityIsometry;//CHOOSE THIS WITH PROPER FUNCTION
    fixPosition=fixPositionTest(hitLocal);
    //localColor=testColor;
    localColor=allLocalLights(baseColor, marchShadows,fixPosition);

    //------ Global Lighting ----------
    fixPosition=fixPositionTestGlobal(hitLocal);
    globalColor=allGlobalLights(baseColor,marchShadows, fixPosition);
    
    
    //------ TOTAL FIRST PASS LIGHTING ----------

    //mix these two lighting contributions into the first-pass color
    //the proportion is global/local
    totalColor=mixLights(0.75,localColor,globalColor);
    
    //add fog for distance to the mixed color
    totalColor=fog(totalColor, vec3(0.02,0.02,0.02), distToViewer);
    
    return totalColor;
}

















//----------------------------------------------------------------------------------------------------------------------
// Building the Pixel Color
//----------------------------------------------------------------------------------------------------------------------

//this is the MAIN FUNCTION OF THE SHADER
//it the starting position rayDir, and does the raymarch, reflections, etc


vec3 getPixelColor(tangVector rayDir){
    
    bool firstPass;//keeps track of what pass we are on
    
    vec3 firstPassColor;
    vec3 reflectPassColor;
    vec3 combinedColor;
    
    float firstPassDist;
    float reflectivity;
    Isometry firstPassFix;

    
    firstPass=true;
    firstPassColor=marchedColor(rayDir,firstPass,surfRefl);
//    //marched color runs the raymarch for rayDir, then computes the contributions of the base color, local and global lightings
//    //in addition to returning this color, it (via raymarch), sets the global variables sampletv and distToViewer
//    // via the SDFs, this sets hitWhich, hitLocal
//    //and internally sets surfNormal
//    
 
    //marchedColor passes out the reflectivity of the surface it  reaches, to  determine if marching must continue
    //we save this first reflectivity here, as it  is used at the end to combine colors.
    reflectivity=surfRefl;
    
    //if the reflectivity is zero, we are done
    if(reflectivity==0.){
        return firstPassColor;
    }
    
    //otherwise, we carry on and do a reflection pass
    else{
    
    firstPass=false;
    //collecting the quantities from the first pass march which are useful moving forward
    //as future raymarches will override this
    firstPassDist=distToViewer;
    firstPassFix=totalFixMatrix;
    
    //first, reflect the impact direction wtih respect to the surface normal
    tangVector newDir = reflectOff(sampletv, surfNormal);
    //move the new ray off the surface a little bit
    newDir=geoFlow(newDir,0.01);
    //now march in this new direction and retrieve a color!
    reflectPassColor=marchedColor(newDir, firstPass, surfRefl);
    
        
        
    //now, have the colors from both passes, time to combine them into a final pixel color.
    
    //first move: suitably darken the reflected pass contribution, by weighting by distance of reflection surface from viewer
    reflectPassColor=fog(reflectPassColor,vec3(0.02,0.02,0.02), firstPassDist);
    
    //then, combine with the first pass color using reflectivity:
    combinedColor=(1.-reflectivity)*firstPassColor+reflectivity*reflectPassColor;

    return combinedColor;
    }
}
















//----------------------------------------------------------------------------------------------------------------------
// OLD WAY: a combined function that does both passes internally
//----------------------------------------------------------------------------------------------------------------------


//
//vec3  buildTheColor(tangVector rayDir){
//    
//    
//    
//    
//    
//    vec3 emitLocalColor=vec3(0.);//the total lighting  computation from local lights
//    vec3 emitGlobalColor=vec3(0.);//the total lighting  computation from global lights
//    vec3 emitColor;// the  total lighting computation from all sources
//    
//    vec3 reflLocalColor=vec3(0.);//the total lighting  computation from local lights
//    vec3 reflGlobalColor=vec3(0.);//the total lighting  computation from global lights
//    vec3 reflColor;//the total lighting from all sources at the reflected point
//    
//    vec3 finalColor; //the final color, combining reflection and first march
//
//
//  
//    
//    
//    
//    
//    
//    
//    //------ FIRST PASS RAYMARCH ----------
//    
//    
//    Isometry fixPosition;
//    
//    vec3 surfColor;//color of the surface where it is struck
//    float surfReflectivity;//how reflective the struck surface is
//    
//    
//    
//    firstPass=true;
//    raymarch(rayDir, totalFixMatrix);//do the  raymarch    
//    
//    
//    
//    
//    
//    //------ Basic Surface Properties ----------
//    surfColor=materialColor(hitWhich);
//    surfReflectivity=materialReflectivity(hitWhich);
//    
//    //compute some basic properties of the position on the surface we reached:
//    surfacePosition=sampletv.pos;//position on the surface of the sample point, set by raymarch
//    float emitDistToViewer=distToViewer;//this is set by raymarch, along with sampletv
//    toViewer=turnAround(sampletv);//tangent vector on surface pointing to viewer
//    surfNormal=surfaceNormal(sampletv);//normal vector to surface
//    
//
//    
//    //------ Local Lighting ----------
//    fixPosition=identityIsometry;
//    emitLocalColor=allLocalLights(surfColor, fixPosition);
//
//    //------ Global Lighting ----------
//    fixPosition=composeIsometry(totalFixMatrix,invCellBoost);
//    emitGlobalColor=allGlobalLights(surfColor,fixPosition);
//    
//    
//    //------ TOTAL FIRST PASS LIGHTING ----------
//
//    //mix these two lighting contributions into the first-pass color
//    //the proportion is global/local
//    emitColor=mixLights(0.75,emitLocalColor,emitGlobalColor);
//    
//    //add fog for distance to the mixed color
//    emitColor=fog(emitColor, vec3(0.02,0.02,0.02), distToViewer);
//    
//    
//    
//    
//    return emitColor;
    
    
//    
//    
//    
//    //------ ONTO THE SECOND PASS - REFLECTION LIGHTING  ----------
//    
//    
//    //only run the reflection if the reflectivity of the surface is nonzero!
//    
//    if(surfReflectivity==0.){
//        return emitColor;
//    }
//    
//    else{// actually do the second pass
//    
//    
//    //------ reflection pass - raymarch ----------    
//    firstPass=false;
//    //we do the raymarch again! starting from this position (sampletv)
//    //first, reflect this direction wtih respect to the surface normal
//    tangVector newDir = reflectOff(sampletv, surfNormal);
//    //move the new ray off a little bit
//    newDir=geoFlow(newDir,0.01);
//    //then, raymarch in this new direction
//
//    //the raymarcher reflectmarch is built to allow some corner-cutting for speed
//    //but, you can also run raymarch here directly
//    reflectmarch(newDir, totalFixMatrix);
//    //this has reset values like distToViewer (why we had to save the old one above), and sampletv to reflect the new positions
//    
//        
//        
//    //------ Basic Surface Properties ----------
//    surfColor=materialColor(hitWhich);
//    //recompute basic properties, from new location
//    surfacePosition=sampletv.pos;//position on the surface of the sample point, set by raymarch
//    toViewer=turnAround(sampletv);//tangent vector on surface pointing to viewer
//    surfNormal=surfaceNormal(sampletv);//normal vector to surface
//    
//        
//        
//        
//        
//    //------ Reflected Local Lighting ----------    
//    fixPosition=identityIsometry;
//    //figure out the local lighting contribution
//    reflLocalColor=allLocalLights(surfColor, fixPosition);
//    
//    //------ Global Lighting ----------
//    fixPosition=totalFixMatrix;
//    reflGlobalColor=allGlobalLights(surfColor,fixPosition);
//        
//        
//    
//    
//    
//    //mix together these two contributions to the emitted color
//    //the proportion is global/local
//    reflColor=mixLights(0.75,reflLocalColor,reflGlobalColor);
//    
//    
//    //add in fog in the reflection (so far away reflected items are blurry)
//    reflColor=fog(reflColor,vec3(0.02,0.02,0.02),distToViewer);
//    
//    //add in fog from the original distance! this darkens the entire reflected surface by the same proportion that fog initially darkened the surface
//    //otherwise - far away objexts would look more reflective than nearby ones, as their emitted color is drown out by fog but the reflected is not!
//    reflColor=fog(reflColor,vec3(0.02,0.02,0.02),emitDistToViewer);
//    
//    //now we have both color contributions: the first pass color and the reflected part
//    
//    //build the total color
//    //uniform mirror dictates how reflective the  surface is
//    //reflectivity for other surfaces is given  in material properties
//    finalColor=(1.-surfReflectivity)*emitColor+surfReflectivity*reflColor;
//    
//    
//    return finalColor;
//    
//}
    
//}
    
    
    
    
    
    
    
    
