//----------------------------------------------------------------------------------------------------------------------
// Light Attenuation with  Distance and Angle
//----------------------------------------------------------------------------------------------------------------------


//inverse area density, or fake lighting

float lightAtt(float dist, Vector angle){
    //distance is the distance between the viewer and the lightsource.
    //angle is the unit tangent vector pointing from the light source towards the illuminated object
        if (FAKE_LIGHT_FALLOFF){
        //fake falloff
        return 0.1+0.5*dist;
    }
    
    //actual distance function
    return 0.2*exp(-dist*dist*10.)+AreaDensity(dist,angle);
        //0.1+areaElement(dist,angle);//make a function like surfArea in globalGeometry to compute this
}




//NORMAL FUNCTIONS ++++++++++++++++++++++++++++++++++++++++++++++++++++
// the coordinates refer to a prefered basis, which is geometry dependent
// Remi : NOW GEOMETRY INDEPENDENT...
Vector estimateNormal(Point p) {
    //float newEp = EPSILON * 10.0;
    float newEp = 0.01;

    Point shiftPX = smallShift(p, vec3(newEp, 0, 0));
    Point shiftPY = smallShift(p, vec3(0, newEp, 0));
    Point shiftPZ = smallShift(p, vec3(0, 0, newEp));
    Point shiftMX = smallShift(p, vec3(-newEp, 0, 0));
    Point shiftMY = smallShift(p, vec3(0, -newEp, 0));
    Point shiftMZ = smallShift(p, vec3(0, 0, -newEp));

    Vector n;

    if (hitWhich==3||hitWhich==1){
         n = createVector(p, vec3(
        localSceneSDF(shiftPX) - localSceneSDF(shiftMX),
        localSceneSDF(shiftPY) - localSceneSDF(shiftMY),
        localSceneSDF(shiftPZ) - localSceneSDF(shiftMZ)
        ));
        
    }
    else {// little hack, otherwise the shader collaspe when there are too many objets in the scene.
        /*
        float ref = globalSceneSDF(p);
        float vgx = globalSceneSDF(shiftPX) - ref;
        float vgy = globalSceneSDF(shiftPY) - ref;
        float vgz = globalSceneSDF(shiftPZ) - ref;
        */
        //global light scene
        float vgx = globalSceneSDF(shiftPX) - globalSceneSDF(shiftMX);
        float vgy = globalSceneSDF(shiftPY) - globalSceneSDF(shiftMY);
        float vgz = globalSceneSDF(shiftPZ) - globalSceneSDF(shiftMZ);
        n = createVector(p, vec3(vgx, vgy, vgz));
    }
    n = tangNormalize(n);
    return n;
}


//match the other naming convention 
Vector surfaceNormal(Point p){
    return estimateNormal(p);
}




//----------------------------------------------------------------------------------------------------------------------
// Fog
//----------------------------------------------------------------------------------------------------------------------


vec3 fog(vec3 color, float distToViewer){
    return exp(-distToViewer/10.)*color;
}






//----------------------------------------------------------------------------------------------------------------------
// Specularity and Diffusivity of Surfaces
//----------------------------------------------------------------------------------------------------------------------

//toLight and toViewer are tangent vectors at sample point, pointed at the light source and viewer respectively
vec3 phongShading(Vector toLight, Vector toViewer, Vector  surfNormal, float distToLight, vec3 baseColor, vec3 lightColor, float lightIntensity,Vector atLight){
    //Calculations - Phong Reflection Model

    //this is tangent vector to the incomming light ray
    Vector fromLight=turnAround(toLight);
    //now reflect it off the surfce
    Vector reflectedRay = reflectOff(fromLight,surfNormal);
    //Calculate Diffuse Component
    float nDotL = max(cosAng(surfNormal, toLight), 0.0);
    vec3 diffuse = lightColor.rgb * nDotL;
    //Calculate Specular Component
    float rDotV = max(cosAng(reflectedRay, toViewer), 0.0);
    vec3 specular = lightColor.rgb * pow(rDotV,25.0);
    //Attenuation - of the light intensity due to distance from source
    float att = lightIntensity /lightAtt(distToLight,atLight);
    //Combine the above terms to compute the final color
    return (baseColor*(diffuse + .15) + vec3(.6, .5, .5)*specular*2.) * att;
  // return att*(baseColor) ;
}







//----------------------------------------------------------------------------------------------------------------------
// Packaging this up: LOCAL LIGHTING ROUTINES
//----------------------------------------------------------------------------------------------------------------------



//contribution from a single light source
vec3 Light(Point lightPosition, vec3 lightColor, float lightIntensity,vec3 baseColor, Isometry fixPosition){
    
    //compute the local data we need at the point of intersection
    Point surfacePosition=sampletv.pos;
    surfNormal=surfaceNormal(surfacePosition);
    toViewer=turnAround(sampletv);
    
    tangDirection(surfacePosition,lightPosition, toLight,distToLight);
    
    //flow to the light, then turn around to face surface to get initial tangent vector
    atLight=turnAround(flow(toLight,distToLight));
    
    //apply the phong shading model
    return phongShading(toLight, toViewer, surfNormal, distToLight,baseColor,lightColor,lightIntensity,atLight);
 
}



//local light, done via nearest neighbors

vec3 localLight(Point lightPosition, vec3 lightColor, float lightIntensity,vec3 baseColor, Isometry fixPosition){
    
    Point transLightPosition;
    
    //light from the main source
    vec3 totalLight=vec3(0.);
        
    totalLight+=Light(lightPosition,lightColor,lightIntensity,baseColor,fixPosition);
    
    //light from nearest neighbor sources
    for(int i=0;i<numGens;i++){
        //translate light position by generator
        transLightPosition=translate(gens[i],lightPosition);
        
        //run the lighting command
        totalLight+=Light(transLightPosition,lightColor,lightIntensity,baseColor,fixPosition);
        
    }

    return totalLight;
    
}









