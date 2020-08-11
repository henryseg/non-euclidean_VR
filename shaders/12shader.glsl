//----------------------------------------------------------------------------------------------------------------------
// Choosing the Placement of the Actual Light Sources
//----------------------------------------------------------------------------------------------------------------------

vec3 allLocalLights(vec3 baseColor, Isometry fixPosition){
    //just one local light right now
    

    return localLight(localLightPos,vec3(1.),1.,baseColor,fixPosition);
        
  
}




//----------------------------------------------------------------------------------------------------------------------
// Color at the end of a single raymarch
//----------------------------------------------------------------------------------------------------------------------


vec3 getPixelColor(Vector rayDir){
    
    //CHOOSE THIS WITH A PROPER FUNCTION
    Isometry fixPosition=identity;
    
    vec3 baseColor;//color of the surface where it is struck
    
    vec3 firstColor;//orig lighting
    
    vec3 reflColor;//reflected lighting
    
    vec3 totalColor;// combined lighting
    
    float origDist;
    
    //------ DOING THE RAYMARCH ----------

    raymarch(rayDir,totalFixIsom);//do the  raymarch    
    origDist=distToViewer;
    
    //------ Basic Surface Properties ----------
    //we need these quantities to run the local / global lighting functions
    baseColor=materialColor(hitWhich);
    surfRefl=materialReflectivity(hitWhich);
    surfacePosition=sampletv.pos;//position on the surface of the sample point, set by raymarch
    toViewer=turnAround(sampletv);//tangent vector on surface pointing to viewer / origin of raymarch
    surfNormal=surfaceNormal(sampletv.pos);//normal vector to surface
    

    //------ Local Lighting ----------
    //fixPosition=identityIsometry;//CHOOSE THIS WITH PROPER FUNCTION
    firstColor=allLocalLights(baseColor, fixPosition)+0.2*baseColor;
    
    
    //NO REFLECTIONS
 return fog(firstColor,distToViewer);
 //   return firstColor;
    
    
    
    
    
    // ----------------------------------------------------------------------------------------------
    //REFLECTIONS ARE NOT WORKRING: SHADER CRASHES!
    // ----------------------------------------------------------------------------------------------
//    
//     if(surfRefl==0.){
//        return fog(firstColor,distToViewer);
//    }
//    
//    //otherwise, we carry on and do a reflection pass
//    else{
//    
//   // firstPassDist=distToViewer;
//    //firstPassFix=totalFixMatrix;
//    
//    //first, reflect the impact direction wtih respect to the surface normal
//    Vector newDir = reflectOff(sampletv, surfNormal);
//    //move the new ray off the surface a little bit
//    newDir=flow(newDir,0.01);
//    //now march in this new direction and retrieve a color!
//     
//    //------ DOING THE RAYMARCH ----------
//
//    raymarch(newDir,totalFixIsom);//do the  raymarch    
//    
//    //------ Basic Surface Properties ----------
//    //we need these quantities to run the local / global lighting functions
//    baseColor=materialColor(hitWhich);
//    surfacePosition=sampletv.pos;//position on the surface of the sample point, set by raymarch
//    toViewer=turnAround(sampletv);//tangent vector on surface pointing to viewer / origin of raymarch
//    surfNormal=surfaceNormal(sampletv.pos);//normal vector to surface
//    
//
//    //------ Local Lighting ----------
//    //fixPosition=identityIsometry;//CHOOSE THIS WITH PROPER FUNCTION
//    reflColor=allLocalLights(baseColor, fixPosition)+0.2*baseColor;
//    
//        
//    //now, have the colors from both passes, time to combine them into a final pixel color.
//    
//    //first move: suitably darken the reflected pass contribution, by weighting by distance of reflection surface from viewer
//    reflColor=fog(reflColor,distToViewer);
//    
//    //then, combine with the first pass color using reflectivity:
//    totalColor=(1.-surfRefl)*firstColor+surfRefl*reflColor;
//
//        
//    //now add fog
//    totalColor=fog(totalColor,origDist);
//        
//    return totalColor;
//    }
}
    
    
    
    
    
    
    
    
    
    
    
    




