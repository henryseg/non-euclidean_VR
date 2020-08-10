//----------------------------------------------------------------------------------------------------------------------
// Light Attenuation with  Distance and Angle
//----------------------------------------------------------------------------------------------------------------------
//light intensity as a fn of distance
float lightAtt(float dist){
    
    //actual distance function
    return 0.2*exp(-dist*dist*10.)+dist*dist;
}


//the function below is an overload of the above, for when we are able to provide the correct function

float lightAtt(float dist, Vector angle){
    //distance is the distance between the viewer and the lightsource.
    //angle is the unit tangent vector pointing from the light source towards the illuminated object
        if (FAKE_LIGHT_FALLOFF){
        //fake falloff
        return 0.1+0.5*dist;
    }
    
    //actual distance function
    return 0.2*exp(-dist*dist*10.)+dist*dist;
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
    return exp(-distToViewer/3.)*color;
}






//----------------------------------------------------------------------------------------------------------------------
// Specularity and Diffusivity of Surfaces
//----------------------------------------------------------------------------------------------------------------------

//toLight and toViewer are tangent vectors at sample point, pointed at the light source and viewer respectively
vec3 phongShading(Vector toLight, Vector toViewer, Vector  surfNormal, float distToLight, vec3 baseColor, vec3 lightColor, float lightIntensity){
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
    float att = lightIntensity /lightAtt(distToLight);
    //Combine the above terms to compute the final color
    return (baseColor*(diffuse + .15) + vec3(.6, .5, .5)*specular*2.) * att;
  // return att*(baseColor) ;
}







//----------------------------------------------------------------------------------------------------------------------
// Packaging this up: LOCAL LIGHTING ROUTINES
//----------------------------------------------------------------------------------------------------------------------









































//----------------------------------------------------------------------------------------------------------------------
// Lighting Functions
//----------------------------------------------------------------------------------------------------------------------
//SP - Sample Point | TLP - Translated Light Position | V - View Vector
vec3 lightingCalculations(Point SP, Point TLP, Vector V, vec3 baseColor, vec4 lightIntensity){
    // Distance to the light
    // Small hack:
    // if the light is too far (and the related computations could create numerical erroe such as nan),
    // then we simply ignore it
    float fakeDistToLight = fakeDist(SP, TLP);

    if (fakeDistToLight < 1000.) {
        //Calculations - Phong Reflection Model
        Vector L;
        float distToLight;
        tangDirection(SP, TLP, L, distToLight);
        Vector R = sub(scalarMult(2.0 * cosAng(L, N), N), L);
        //Calculate Diffuse Component
        float nDotL = max(cosAng(N, L), 0.0);
        vec3 diffuse = lightIntensity.rgb * nDotL;
        //Calculate Specular Component
        float rDotV = max(cosAng(R, V), 0.0);
        vec3 specular = lightIntensity.rgb * pow(rDotV, 10.0);
        //Attenuation - Of the Light Intensity

        float att = 0.6 * lightIntensity.w / (0.01 + lightAtt(distToLight));
        //Compute final color

        // DEBUGGING
        return att*((diffuse*baseColor) + specular);
        //return L.dir;
        //return vec3(distToLight);
    }
    else {
        return vec3(0);
    }


}

vec3 phongModel(Isometry totalFixIsom, vec3 color){
    Point SP = sampletv.pos;
    Point TLP;//translated light position
    Vector V = turnAround(sampletv);

    vec3 surfColor;
    surfColor = 0.2 * vec3(1.) + 0.8 * color;

    if (display == 3 || display == 4){ //for the dragon skin one only
        surfColor = 0.7 * vec3(1.) + 0.3 * color;//make it brighter when there's less stuff
    }
    //    vec3 color = vec3(0.0);
    //--------------------------------------------------
    //Lighting Calculations
    //--------------------------------------------------
    //usually we'd check to ensure there are 4 lights
    //however this is version is hardcoded so we won't

    //GLOBAL LIGHTS THAT WE DONT ACTUALLY RENDER


    for (int i = 0; i<4; i++){
        Isometry totalIsom = composeIsometry(totalFixIsom, invCellBoost);
        TLP = translate(totalIsom, unserializePoint(lightPositions[i]));
        color += lightingCalculations(SP, TLP, V, surfColor, lightIntensities[i]);
    }


    //LOCAL LIGHT
    //color += lightingCalculations(SP, localLightPos, V, surfColor, localLightColor);
    color += 2. * lightingCalculations(SP, localLightPos, V, surfColor, localLightColor);
    //light color and intensity hard coded in

    /*
    //move local light around by the generators to pick up lighting from nearby cells
    for (int i=0; i<6; i++){
        //TLP=invGenerators[i]*localLightPos;
        TLP = translate(unserializeIsom(invGenerators[i]), localLightPos);
        color+= lightingCalculations(SP, TLP, V, surfColor, localLightColor);
    }
    */

    return color;
}



vec3 lightColor(Isometry totalFixIsom, Vector sampletv, vec3  colorOfLight){
    N = estimateNormal(sampletv.pos);
    vec3 color;
    color = phongModel(totalFixIsom, 0.5 * colorOfLight);
    color = 0.7 * color + 0.3;
    return color;
}

vec3 ballColor(Isometry totalFixIsom, Vector sampletv){
    /*
    if (EARTH){
        N = estimateNormal(sampletv.pos);
        vec3 color = texture(earthCubeTex, sphereOffset(globalObjectBoost, sampletv.pos)).xyz;
        vec3 color2 = phongModel(totalFixIsom, color);
        //color = 0.9*color+0.1;
        return 0.5 * color + 0.5 * color2;
    }
    else */
    {

        N = estimateNormal(sampletv.pos);
        vec3 color=localLightColor.xyz;
        color = phongModel(totalFixIsom, 0.5 * color);
        color = 0.7*color+0.3;
        return color;


        //generically gray object (color= black, glowing slightly because of the 0.1)
    }

}


vec3 tilingColor(Isometry totalFixIsom, Vector sampletv){
    //    if (FAKE_LIGHT){//always fake light in Sol so far

    //make the objects have their own color
    //color the object based on its position in the cube
    Point samplePos=sampletv.pos;

    /*
    vec4 aux4 = abs(toVec4(samplePos));
    vec3 color = abs(tanh(aux4.xyw));
    //vec3 color = 1.1 * aux4.xyw / length(aux4.xyw);
    */

    //IF WE HIT THE TILING
    vec4 aux = toVec4(samplePos);
    float x=aux.x;
    float y=aux.y;
    float z=aux.z;
    vec3 color = vec3(x, y, z);


    N = estimateNormal(sampletv.pos);
    color = phongModel(totalFixIsom, 0.1*color);

    return 0.9*color+0.1;

    //adding a small constant makes it glow slightly
    //}
    //    else {
    //        //if we are doing TRUE LIGHTING
    //        // objects have no natural color, only lit by the lights
    //        N = estimateNormal(sampletv.pos);
    //        vec3 color=vec3(0., 0., 0.);
    //        color = phongModel(totalFixIsom, color);
    //        return color;
    //    }
}

