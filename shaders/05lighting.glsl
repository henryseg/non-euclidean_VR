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
    // shift = makeLeftTranslation(p);
    //dir = shift.mat * dir;
    //debugColor = 0.5 + 0.5 *dir.xyz;
    //debugColor = vec3(0, 0, dir.z);
    //debugColor = dir.xyz;
    return n;
}


//Vector estimateNormal(vec4 p) { // normal vector is in tangent hyperplane to hyperboloid at p
//    // float denom = sqrt(1.0 + p.x*p.x + p.y*p.y + p.z*p.z);  // first, find basis for that tangent hyperplane
//    float newEp = EPSILON * 10.0;
//    mat4 theBasis= tangBasis(p);
//    vec4 basis_x = theBasis[0];
//    vec4 basis_y = theBasis[1];
//    vec4 basis_z = theBasis[2];
//    if (hitWhich != 3){ //global light scene
//        //p+EPSILON * basis_x should be lorentz normalized however it is close enough to be good enough
//        Vector tv = Vector(p,
//        basis_x * (globalSceneSDF(p + newEp*basis_x) - globalSceneSDF(p - newEp*basis_x)) +
//        basis_y * (globalSceneSDF(p + newEp*basis_y) - globalSceneSDF(p - newEp*basis_y)) +
//        basis_z * (globalSceneSDF(p + newEp*basis_z) - globalSceneSDF(p - newEp*basis_z))
//        );
//        return tangNormalize(tv);
//
//    }
//    else { //local scene
//        Vector tv = Vector(p,
//        basis_x * (localSceneSDF(p + newEp*basis_x) - localSceneSDF(p - newEp*basis_x)) +
//        basis_y * (localSceneSDF(p + newEp*basis_y) - localSceneSDF(p - newEp*basis_y)) +
//        basis_z * (localSceneSDF(p + newEp*basis_z) - localSceneSDF(p - newEp*basis_z))
//        );
//        return tangNormalize(tv);
//    }
//}


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

//made some modifications to lighting calcuatiojns
//put a coefficient of 2 in front of specular to make things shiny-er
//changed the power from original of 10 on specular
//in PHONG MODEL changed amount of color from 0.1 to more
//vec3 lightingCalculations(vec4 SP, vec4 TLP, Vector V, vec3 baseColor, vec4 lightIntensity){
//    //Calculations - Phong Reflection Model
//    Vector L = tangDirection(SP, TLP);
//    Vector R = sub(scalarMult(2.0 * cosAng(L, N), N), L);
//    //Calculate Diffuse Component
//    float nDotL = 1.-max(-cosAng(N, L), 0.0);
//    vec3 diffuse = vec3(1., 1., 1.)*lightIntensity.rgb * nDotL;
//    //Calculate Specular Component
//    float rDotV = max(cosAng(R, V), 0.0);
//    vec3 specular = (0.5*lightIntensity.rgb+vec3(0.5, 0.5, 0.5)) * pow(rDotV, 5.0);
//    //Attenuation - Inverse Square
//    //float distToLight = fakeDistance(SP, TLP);
//    float att = 0.5;
//    //0.8/(0.1+distToLight);
//    //0.6*lightIntensity.w /(0.01 + lightAtt(distToLight));
//    //Compute final color
//    vec3 amb=0.1*vec3(0.2, 1., 1.)*baseColor;
//    vec3 diff=0.5*diffuse*baseColor;
//    vec3 spec=1.5*specular;
//    return diff+spec;
//}


// overload of the previous function
//SP - Sample Point | DTLP - Direction to the Translated Light Position | V - View Vector

//made some modifications to lighting calcuatiojns
//put a coefficient of 2 in front of specular to make things shiny-er
//changed the power from original of 10 on specular
//in PHONG MODEL changed amount of color from 0.1 to more
vec3 lightingCalculations(Point SP, Vector DTLP, float distToLight, Vector V, vec3 baseColor, vec4 lightIntensity){
    //Calculations - Phong Reflection Model
    Vector R = reflectOff(DTLP, N);
    //debugColor = R.dir.xyz;
    //Vector R = sub(scalarMult(2.0 * cosAng(DTLP, N), N), DTLP);

    //Calculate Diffuse Component
    float nDotL = 1. - max(-cosAng(N, DTLP), 0.0);
    vec3 diffuse = vec3(1., 1., 1.) * lightIntensity.rgb * nDotL;
    //Calculate Specular Component
    float rDotV = max(cosAng(R, V), 0.0);
    vec3 specular = (0.5 * lightIntensity.rgb + vec3(0.5, 0.5, 0.5)) * pow(rDotV, 5.0);

    //Attenuation - Inverse Square
    //float distToLight = fakeDistance(SP, TLP);
    float att = 0.5;
    //0.8 / (0.1 + distToLight);
    //0.6 * lightIntensity.w / (0.01 + lightAtt(distToLight));
    //Compute final color
    vec3 amb = 0.1 * vec3(0.2, 1., 1.) * baseColor;
    vec3 diff = 0.5 * diffuse * baseColor;
    vec3 spec = 1.5 * specular;
    return diff + spec;
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
    vec4 lightColor3 = vec4(245. / 256., 61. / 256., 82. / 256., 1.);//red
    //vec4 lightColor4 = vec4(256. / 256., 142. / 256., 226. / 256., 1.);//pink
    vec4 lightColor4 = vec4(1, 1, 1, 1);//whit

    bool otherDir1 = true;
    bool otherDir2 = false;
    bool otherDir = otherDir1 || otherDir2;


    shiftLight = composeIsometry(totalFixIsom, unserializeIsom(invCellBoost));

    TLP = translate(shiftLight, Point(vec4(10., 0., 10., 1.)));
    tangDirection(SP, TLP, DTLP, distToLight);
    color = lightingCalculations(SP, DTLP, distToLight, V, baseColor, lightColor1);
    if (otherDir && tangDirectionBis(SP, TLP, DTLPbis, distToLightBis)) {
        //debugColor = lightColor1.xyz;
        if (otherDir1) {
            color += lightingCalculations(SP, DTLPbis[0], distToLightBis[0], V, baseColor, lightColor1);
        }
        if (otherDir2){
            color += lightingCalculations(SP, DTLPbis[1], distToLightBis[1], V, baseColor, lightColor1);
        }
    }


    TLP = translate(shiftLight, Point(vec4(0., 10., 10., 1.)));
    tangDirection(SP, TLP, DTLP, distToLight);
    color += lightingCalculations(SP, DTLP, distToLight, V, baseColor, lightColor2);
    if (otherDir && tangDirectionBis(SP, TLP, DTLPbis, distToLightBis)) {
        if (otherDir1) {
            color += lightingCalculations(SP, DTLPbis[0], distToLightBis[0], V, baseColor, lightColor2);
        }
        if (otherDir2){
            color += lightingCalculations(SP, DTLPbis[1], distToLightBis[1], V, baseColor, lightColor2);
        }
    }


    TLP = translate(shiftLight, Point(vec4(-10., 0, 5., 1.)));
    tangDirection(SP, TLP, DTLP, distToLight);
    color += lightingCalculations(SP, DTLP, distToLight, V, baseColor, lightColor3);
    if (otherDir && tangDirectionBis(SP, TLP, DTLPbis, distToLightBis)) {
        if (otherDir1) {
            color += lightingCalculations(SP, DTLPbis[0], distToLightBis[0], V, baseColor, lightColor3);
        }
        if (otherDir2){
            color += lightingCalculations(SP, DTLPbis[1], distToLightBis[1], V, baseColor, lightColor3);
        }
    }


    TLP = translate(shiftLight, Point(vec4(1, 1., 10, 1.)));
    tangDirection(SP, TLP, DTLP, distToLight);
    //debugColor = vec3(0, 0, DTLP.dir.z);
    //debugColor = V.dir.xyz;
    color += lightingCalculations(SP, DTLP, distToLight, V, baseColor, lightColor4);
    if (otherDir && tangDirectionBis(SP, TLP, DTLPbis, distToLightBis)) {
        if (otherDir1) {
            color += lightingCalculations(SP, DTLPbis[0], distToLightBis[0], V, baseColor, lightColor4);
        }
        if (otherDir2){
            color += lightingCalculations(SP, DTLPbis[1], distToLightBis[1], V, baseColor, lightColor4);
        }
    }


    //    }

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










