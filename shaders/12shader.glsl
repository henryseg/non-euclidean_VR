







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
    






vec3 getReflectColor(Vector rayDir){
    float origDist;
    Vector newDir;
    
    vec3 baseColor;//color of the surface where it is struck
    
    vec3 firstColor=vec3(0.);//orig lighting
    vec3 reflColor=vec3(0.);
    vec3 totalColor=vec3(0.);
    
    //------ DOING THE RAYMARCH ----------

    raymarch(rayDir,totalFixIsom);//do the  raymarch    
    //get surface data
    origDist=distToViewer;
    
    baseColor=materialColor(hitWhich);
    surfNormal=surfaceNormal(sampletv.pos);
    toViewer=turnAround(sampletv);

    firstColor+=fakeLight(baseColor,vec3(1.,0.,0.));
    firstColor+=fakeLight(baseColor,vec3(0.,1,0.));
    firstColor+=fakeLight(baseColor,vec3(0.,0.,1.));
    
    
    if(refl==0.||distToViewer>4.||hitWhich==2){
        //if the reflection is zero, or you are far away, or you are at the earth
        totalColor=firstColor;
    }
    
    else{
//do the reflection!
    
    newDir = reflectOff(sampletv, surfNormal);
    newDir=flow(newDir,0.05);
    
     raymarch(newDir,totalFixIsom);//do the  raymarch    
    //get surface data
    
    baseColor=materialColor(hitWhich);
    surfNormal=surfaceNormal(sampletv.pos);
    toViewer=turnAround(sampletv);

    reflColor+=fakeLight(baseColor,vec3(1.,0.,0.));
    reflColor+=fakeLight(baseColor,vec3(0.,1,0.));
    reflColor+=fakeLight(baseColor,vec3(0.,0.,1.));
    
    reflColor*=exp(-distToViewer*(0.2+foggy)/2.);
    
    
    totalColor=(1.-refl)*firstColor+refl*reflColor;
    }
    
    
    
    
        //add in fog (adjustable in UI)
    totalColor*=exp(-origDist*(0.2+foggy)/2.);
   

    //adjust brightness in UI
    totalColor*=(0.2+lightRad);
    

    return totalColor;
    
}
    

