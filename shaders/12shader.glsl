//----------------------------------------------------------------------------------------------------------------------
// Choosing the Placement of the Actual Light Sources
//----------------------------------------------------------------------------------------------------------------------

vec3 allLocalLights(vec3 baseColor, Isometry fixPosition){
    //just one local light
    return localLight(localLightPos,vec3(1.),1.,baseColor,fixPosition);
}

vec3 allGlobalLights(vec3 baseColor, Isometry fixPosition){
    
    vec3 globalColor=vec3(0.);
    Point TLP;
    
     for (int i=0; i<4; i++){
         //move the light appropriately
        Isometry totalIsom = composeIsometry(totalFixIsom, invCellBoost);
        TLP = translate(totalIsom, unserializePoint(lightPositions[i]));
    
         //add its color contribution
         globalColor+=globalLight(TLP, lightIntensities[i].xyz, 1.,baseColor,fixPosition);
     }
    
    //normalize the output color by dividing by the number of light sources
    return globalColor/4.;
    
    
    return baseColor;
}


//----------------------------------------------------------------------------------------------------------------------
// Color at the end of a single raymarch
//----------------------------------------------------------------------------------------------------------------------


vec3 marchedColor(Vector rayDir, out float surfRefl){
    
    //CHOOSE THIS WITH A PROPER FUNCTION
    Isometry fixPosition=identity;
    
    vec3 baseColor;//color of the surface where it is struck
    
    vec3 localColor;//the total lighting  computation from local lights
    vec3 globalColor;//the total lighting  computation from global lights
    vec3 totalColor;// the  total lighting computation from all sources
       
    
    //------ DOING THE RAYMARCH ----------

    raymarch(rayDir,totalFixIsom);//do the  raymarch    
   
    
    //------ Basic Surface Properties ----------
    //we need these quantities to run the local / global lighting functions
    baseColor=materialColor(hitWhich);
    surfRefl=materialReflectivity(hitWhich);
    surfacePosition=sampletv.pos;//position on the surface of the sample point, set by raymarch
    toViewer=turnAround(sampletv);//tangent vector on surface pointing to viewer / origin of raymarch
    surfNormal=surfaceNormal(sampletv.pos);//normal vector to surface
    
    
    //------ Local Lighting ----------
    //fixPosition=identityIsometry;//CHOOSE THIS WITH PROPER FUNCTION
    localColor=allLocalLights(baseColor, fixPosition);

    //------ Global Lighting ----------
    globalColor=allGlobalLights(baseColor, fixPosition);
    
    
    //------ TOTAL FIRST PASS LIGHTING ----------

    //mix these two lighting contributions into the first-pass color
    //the proportion is global/local
    totalColor=0.75*localColor+0.25*globalColor;
    
    //add fog for distance to the mixed color
    totalColor=fog(totalColor, distToViewer);
    
    return totalColor;
}








//----------------------------------------------------------------------------------------------------------------------
// Total color: reflections + fog + whatever
//----------------------------------------------------------------------------------------------------------------------





vec3 getPixelColor(Vector rayDir){
    
    vec3 firstPassColor;
    vec3 reflectPassColor;
    vec3 combinedColor;
    
    float firstPassDist;
    float reflectivity;
    Isometry firstPassFix;

    
    firstPassColor=marchedColor(rayDir,surfRefl);
 //marched color runs the raymarch for rayDir, then computes the contributions of the base color, local and global lightings
//    //in addition to returning this color, it (via raymarch), sets the global variables sampletv and distToViewer
// via the SDFs, this sets hitWhich, hitLocal
//and internally sets surfNormal
 
//marchedColor passes out the reflectivity of the surface it  reaches, to  determine if marching must continue
    reflectivity=surfRefl;
    
    return firstPassColor;
//    //if the reflectivity is zero, we are done
//    if(reflectivity==0.){
//        return firstPassColor;
//    }
//    
//    //otherwise, we carry on and do a reflection pass
//    else{
//    
//    firstPass=false;
//    //collecting the quantities from the first pass march which are useful moving forward
//    //as future raymarches will override this
//    firstPassDist=distToViewer;
//    firstPassFix=totalFixMatrix;
//    
//    //first, reflect the impact direction wtih respect to the surface normal
//    tangVector newDir = reflectOff(sampletv, surfNormal);
//    //move the new ray off the surface a little bit
//    newDir=geoFlow(newDir,0.01);
//    //now march in this new direction and retrieve a color!
//    reflectPassColor=marchedColor(newDir, firstPass, surfRefl);
//        
//        
//    //now, have the colors from both passes, time to combine them into a final pixel color.
//    
//    //first move: suitably darken the reflected pass contribution, by weighting by distance of reflection surface from viewer
//    reflectPassColor=fog(reflectPassColor,vec3(0.02,0.02,0.02), firstPassDist);
//    
//    //then, combine with the first pass color using reflectivity:
//    combinedColor=(1.-reflectivity)*firstPassColor+reflectivity*reflectPassColor;
//
//    return combinedColor;
//    }
}














   
//   vec3 getPixelColor(Vector rayDir){
//       
//       vec3 pixelColor;
//    
//   
//    //do the marching
//    raymarch(rayDir, totalFixIsom);
//
//    
//   //set the color
//   switch (hitWhich){
//        case 0://Didn't hit anything
//        //COLOR THE FRAME DARK GRAY
//        //0.2 is medium gray, 0 is black
//        return vec3(0.05);
//
//        case 1:// global lights
//        pixelColor= lightColor(totalFixIsom, sampletv, colorOfLight);
//        //out_FragColor=vec4(pixelColor, 1.0);
//        return colorOfLight;
//
//        case 2:// global object
//        pixelColor= ballColor(totalFixIsom, sampletv);
//        //debugColor = abs(N.dir);
//        //pixelColor = debugColor;
//        return pixelColor;
//    
//
//        case 3:// local objects
//        pixelColor= tilingColor(totalFixIsom, sampletv);
//        return pixelColor;
//    
//
//        case 5:
//        //debug
//        return debugColor;
//    }
//       
//}
