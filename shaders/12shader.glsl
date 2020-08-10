//----------------------------------------------------------------------------------------------------------------------
// Choosing the Placement of the Actual Light Sources
//----------------------------------------------------------------------------------------------------------------------

vec3 allLocalLights(vec3 baseColor, Isometry fixPosition){
    return baseColor;
}

vec3 allGlobalLights(vec3 baseColor, Isometry fixPosition){
    return baseColor;
}






//----------------------------------------------------------------------------------------------------------------------
// Raymarching and Assigning a Color
//----------------------------------------------------------------------------------------------------------------------


vec3 marchedColor(Vector rayDir, out float surfRefl){
    
    //CHOOSE THIS WITH A PROPER FUNCTION
    Isometry fixPosition=identity;
    
    vec3 baseColor;//color of the surface where it is struck
    
    vec3 localColor;//the total lighting  computation from local lights
    vec3 globalColor;//the total lighting  computation from global lights
    vec3 totalColor;// the  total lighting computation from all sources
       
    //tangVector toViewer;
    //vec4 surfacePosition;
    
    
    
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

























   
   vec3 getPixelColor(Vector rayDir){
       
       vec3 pixelColor;
    
   
    //do the marching
    raymarch(rayDir, totalFixIsom);

    
   //set the color
   switch (hitWhich){
        case 0://Didn't hit anything
        //COLOR THE FRAME DARK GRAY
        //0.2 is medium gray, 0 is black
        return vec3(0.05);

        case 1:// global lights
        pixelColor= lightColor(totalFixIsom, sampletv, colorOfLight);
        //out_FragColor=vec4(pixelColor, 1.0);
        return colorOfLight;

        case 2:// global object
        pixelColor= ballColor(totalFixIsom, sampletv);
        //debugColor = abs(N.dir);
        //pixelColor = debugColor;
        return pixelColor;
    

        case 3:// local objects
        pixelColor= tilingColor(totalFixIsom, sampletv);
        return pixelColor;
    

        case 5:
        //debug
        return debugColor;
    }
       
}
