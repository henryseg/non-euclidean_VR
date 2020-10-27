

//----------------------------------------------------------------------------------------------------------------------
// Color at the end of a single raymarch
//----------------------------------------------------------------------------------------------------------------------


vec3 getPixelColor(Vector rayDir){
    
    Isometry fixPosition=identity;
    
    vec3 baseColor;//color of the surface where it is struck

    //------ DOING THE RAYMARCH ----------
    raymarch(rayDir,totalFixIsom);
    
    //------ Basic Surface Properties ----------
    baseColor=materialColor(hitWhich);   

    return baseColor; 
    
}
