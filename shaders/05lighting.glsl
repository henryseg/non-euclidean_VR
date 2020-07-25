//NORMAL FUNCTIONS ++++++++++++++++++++++++++++++++++++++++++++++++++++
Vector estimateNormal(Point p) {
    float newEp = EPSILON * 10.0;

    Point shiftPX = smallShift(p, vec3(newEp, 0, 0));
    Point shiftPY = smallShift(p, vec3(0, newEp, 0));
    Point shiftPZ = smallShift(p, vec3(0, 0, newEp));
    Point shiftMX = smallShift(p, vec3(-newEp, 0, 0));
    Point shiftMY = smallShift(p, vec3(0, -newEp, 0));
    Point shiftMZ = smallShift(p, vec3(0, 0, -newEp));

    Vector n;
    float vx, vy, vz;

    if (hitWhich != 3){
        // global light scene
        vx = globalSceneSDF(shiftPX) - globalSceneSDF(shiftMX);
        vy = globalSceneSDF(shiftPY) - globalSceneSDF(shiftMY);
        vz = globalSceneSDF(shiftPZ) - globalSceneSDF(shiftMZ);
    }
    else {
        //local scene
        vx = localSceneSDF(shiftPX) - localSceneSDF(shiftMX);
        vy = localSceneSDF(shiftPY) - localSceneSDF(shiftMY);
        vz = localSceneSDF(shiftPZ) - localSceneSDF(shiftMZ);

    }
    n = createVector(p, vec3(vx, vy, vz));
    n = tangNormalize(n);
    vec4 dir = n.dir;
    return n;
}



//----------------------------------------------------------------------------------------------------------------------
// Fog
//----------------------------------------------------------------------------------------------------------------------


//right now super basic fog: just a smooth step function of distance blacking out at max distance.
//the factor of 20 is just empirical here to make things look good - apparently we never get near max dist in euclidean geo
vec3 fog(vec3 color, vec3 fogColor, float distToViewer){
    //float fogDensity=smoothstep(0., MAX_DIST/40., distToViewer);
    //return mix(color, fogColor, fogDensity); 
    return color;
}


//--------------------------------------------------------------------
// Lighting Functions
//--------------------------------------------------------------------
//SP - Sample Point | TLP - Translated Light Position | V - View Vector


// overload of the previous function
//SP - Sample Point | DTLP - Direction to the Translated Light Position | V - View Vector

//made some modifications to lighting calcuatiojns
//put a coefficient of 2 in front of specular to make things shiny-er
//changed the power from original of 10 on specular
//in PHONG MODEL changed amount of color from 0.1 to more
vec3 lightingCalculations(Point SP, Vector DTLP, float distToLight, Vector V, vec3 baseColor, vec4 lightIntensity){
    //this is tangent vector to the incomming light ray
    Vector fromLight=turnAround(DTLP);
    //now reflect it off the surfce
    Vector reflectedRay = reflectOff(fromLight, N);
    //Calculate Diffuse Component
    float nDotL = max(cosAng(N, DTLP), 0.0);
    vec3 diffuse = lightIntensity.rgb * nDotL;
    //Calculate Specular Component
    float rDotV = max(cosAng(reflectedRay, V), 0.0);
    vec3 specular = (0.5 * lightIntensity.rgb + vec3(0.5, 0.5, 0.5)) * pow(rDotV, 5.0);
    //Attenuation - of the light intensity due to distance from source
    float att = 1.;
    //float att =  5. / (0.1 + distToLight);
    // float att = 0.6 * lightIntensity.w / (0.01 + lightAtt(distToLight));
    //Combine the above terms to compute the final color
    return att*((diffuse*baseColor) + specular);
    //    vec3 amb = 0.1 * vec3(0.2, 1., 1.) * baseColor;
    //    vec3 diff = 0.5 * diffuse * baseColor;
    //    vec3 spec = 1.5 * specular;
    //    return diff + spec;
}



vec3 phongModel(Isometry totalFixIsom, vec3 baseColor){
    Point SP = sampletv.pos;
    Point TLP;// translated light position
    Vector DTLP;// direction to the translated light position
    float distToLight;// distance to the light
    Vector[2] DTLPbis;// direction to the translated light position (second and third shortest path)
    float[2] distToLightBis;// distance to the light (second and third shortest path)
    Isometry shiftLight;

    Vector V = turnAround(sampletv);
    // Vector V = Vector(SP, -sampletv.dir);
    //    vec3 color = vec3(0.0);

    //--------------------------------------------------
    //Lighting Calculations
    //--------------------------------------------------
    //usually we'd check to ensure there are 4 lights
    //however this is version is hardcoded so we won't
    //    if(!LOCAL_LIGHTS){
    //    for (int i = 0; i<4; i++){
    //        TLP = totalFixMatrix*invCellBoost*lightPositions[i];
    //        color += lightingCalculations(SP, TLP, V, vec3(1.0), lightIntensities[i]);
    //    }

    vec3 color = 0.1 * baseColor;

    vec4 lightColor1 = vec4(68. / 256., 197. / 256., 203. / 256., 1.);// light blue
    vec4 lightColor2 = vec4(252. / 256., 227. / 256., 21. / 256., 1.);// yellow
    vec4 lightColor4 = vec4(245. / 256., 61. / 256., 82. / 256., 1.);// red
    vec4 lightColor3 = vec4(1, 1, 1, 1);// white

    int nbDir;// number of directions for the point to the light
    Vector[MAX_DIRS_LIGHT] dirs;// directions from the point to the light
    float[MAX_DIRS_LIGHT] lens;// length of the corresponding geodesics


    //bool otherDir = (!FAKE_LIGHT) && (SECOND_DIR_LIGHT || THIRD_DIR_LIGHT);


    shiftLight = composeIsometry(totalFixIsom, unserializeIsom(invCellBoost));
    TLP = translate(shiftLight, Point(vec4(10., 0., 10., 1.)));
    nbDir = directions(SP, TLP, 0, dirs, lens);
    for (int k=0; k < nbDir; k ++) {
        color += lightingCalculations(SP, dirs[k], lens[k], V, baseColor, lightColor1);
    }

    TLP = translate(shiftLight, Point(vec4(0., 10., 10., 1.)));
    nbDir = directions(SP, TLP, 0, dirs, lens);
    for (int k=0; k < nbDir; k ++) {
        color += lightingCalculations(SP, dirs[k], lens[k], V, baseColor, lightColor2);
    }

    //    TLP = translate(shiftLight, Point(vec4(-10., 0, 5., 1.)));
    //    nbDir = directions(SP, TLP, dirs, lens);
    //    for (int k=0; k < nbDir; k ++) {
    //        color += lightingCalculations(SP, dirs[k], lens[k], V, baseColor, lightColor3);
    //    }

    TLP = translate(shiftLight, Point(vec4(1, 1, 12, 1.)));
    nbDir = directions(SP, TLP, 0, dirs, lens);
    for (int k=0; k < nbDir; k ++) {
        color += lightingCalculations(SP, dirs[k], lens[k], V, baseColor, lightColor4);
    }


    //    if(LOCAL_LIGHTS){
    //    //pick up light from the light source in your fundamental domain
    //
    //       color+= lightingCalculations(SP,localLightPos,V,vec3(1.0),vec4(localLightColor,localLightIntensity));
    //
    //
    //move local light around by the generators to pick up lighting from nearby cells


    //    for(int i=0; i<6; i++){
    //        mat4 localLightIsom=invGenerators[i];
    //        TLP=localLightIsom*localLightPos;
    //        color+= lightingCalculations(SP,TLP,V,vec3(1.0),vec4(localLightColor,localLightIntensity));
    //    }


    //}

    return color / 2.;
}










