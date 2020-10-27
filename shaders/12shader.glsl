







vec3 getPixelColor(Vector rayDir){
    
    vec3 baseColor;//color of the surface where it is struck
    
    vec3 totalColor=vec3(0.);//orig lighting
    
    //------ DOING THE RAYMARCH ----------

    raymarch(rayDir,totalFixIsom);//do the  raymarch    
    //get surface data
    baseColor=materialColor(hitWhich);
    surfNormal=surfaceNormal(sampletv.pos);
    toViewer=turnAround(sampletv);

    totalColor+=fakeLight(baseColor,vec3(1.,0.,0.));
    totalColor+=fakeLight(baseColor,vec3(0.,1,0.));
    totalColor+=fakeLight(baseColor,vec3(0.,0.,1.));
    
    //add in fog (adjustable in UI)
    totalColor*=exp(-distToViewer*(0.2+foggy)/2.);
   
    //adjust brightness in UI
    totalColor*=(0.2+lightRad);
    
    return totalColor;
    
}
    

