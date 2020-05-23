


//NORMAL FUNCTIONS ++++++++++++++++++++++++++++++++++++++++++++++++++++
tangVector estimateNormal(vec4 p) { // normal vector is in tangent hyperplane to hyperboloid at p
    // float denom = sqrt(1.0 + p.x*p.x + p.y*p.y + p.z*p.z);  // first, find basis for that tangent hyperplane
    float newEp = EPSILON * 10.0;
    mat4 theBasis= tangBasis(p);
    vec4 basis_x = theBasis[0];
    vec4 basis_y = theBasis[1];
    vec4 basis_z = theBasis[2];
    if (hitWhich != 3){ //global light scene
        //p+EPSILON * basis_x should be lorentz normalized however it is close enough to be good enough
        tangVector tv = tangVector(p,
        basis_x * (globalSceneSDF(p + newEp*basis_x) - globalSceneSDF(p - newEp*basis_x)) +
        basis_y * (globalSceneSDF(p + newEp*basis_y) - globalSceneSDF(p - newEp*basis_y)) +
        basis_z * (globalSceneSDF(p + newEp*basis_z) - globalSceneSDF(p - newEp*basis_z))
        );
        return tangNormalize(tv);

    }
    else { //local scene
        tangVector tv = tangVector(p,
        basis_x * (localSceneSDF(p + newEp*basis_x) - localSceneSDF(p - newEp*basis_x)) +
        basis_y * (localSceneSDF(p + newEp*basis_y) - localSceneSDF(p - newEp*basis_y)) +
        basis_z * (localSceneSDF(p + newEp*basis_z) - localSceneSDF(p - newEp*basis_z))
        );
        return tangNormalize(tv);
    }
}



//----------------------------------------------------------------------------------------------------------------------
// Fog
//----------------------------------------------------------------------------------------------------------------------


//right now super basic fog: just a smooth step function of distance blacking out at max distance.
//the factor of 20 is just empirical here to make things look good - apparently we never get near max dist in euclidean geo
vec3 fog(vec3 color, vec3 fogColor, float distToViewer){
    float fogDensity=smoothstep(0., MAX_DIST/20., distToViewer);
    return mix(color, fogColor, fogDensity); 
}






//--------------------------------------------------------------------
// Lighting Functions
//--------------------------------------------------------------------
//SP - Sample Point | TLP - Translated Light Position | V - View Vector

//made some modifications to lighting calcuatiojns
//put a coefficient of 2 in front of specular to make things shiny-er
//changed the power from original of 10 on specular
//in PHONG MODEL changed amount of color from 0.1 to more
vec3 lightingCalculations(vec4 SP, vec4 TLP, tangVector V, vec3 baseColor, vec4 lightIntensity){
    //Calculations - Phong Reflection Model
    tangVector L = tangDirection(SP, TLP);
    tangVector R = sub(scalarMult(2.0 * cosAng(L, N), N), L);
    //Calculate Diffuse Component
    float nDotL = max(cosAng(N, L), 0.0);
    vec3 diffuse = lightIntensity.rgb * nDotL;
    //Calculate Specular Component
    float rDotV = max(cosAng(R, V), 0.0);
    vec3 specular = 2.*lightIntensity.rgb * pow(rDotV, 20.0);
    //Attenuation - Inverse Square
    float distToLight = fakeDistance(SP, TLP);
    float att = 0.6*lightIntensity.w /(0.01 + lightAtt(distToLight));
    //Compute final color
    return att*((diffuse*baseColor) + specular);
}

vec3 phongModel(mat4 totalFixMatrix, vec3 color){
    vec4 SP = sampletv.pos;
    vec4 TLP;//translated light position
    tangVector V = tangVector(SP, -sampletv.dir);
    //    vec3 color = vec3(0.0);
    //--------------------------------------------------
    //Lighting Calculations
    //--------------------------------------------------
    //usually we'd check to ensure there are 4 lights
    //however this is version is hardcoded so we won't
    if(!LOCAL_LIGHTS){
    for (int i = 0; i<4; i++){
        TLP = totalFixMatrix*invCellBoost*lightPositions[i];
        color += lightingCalculations(SP, TLP, V, vec3(1.0), lightIntensities[i]);
    }
    }
    
    if(LOCAL_LIGHTS){
    //pick up light from the light source in your fundamental domain
  
       color+= lightingCalculations(SP,localLightPos,V,vec3(1.0),vec4(localLightColor,localLightIntensity)); 
    
    
    //move local light around by the generators to pick up lighting from nearby cells
        
        
//    for(int i=0; i<6; i++){
//        mat4 localLightIsom=invGenerators[i];
//        TLP=localLightIsom*localLightPos;
//        color+= lightingCalculations(SP,TLP,V,vec3(1.0),vec4(localLightColor,localLightIntensity)); 
//    }
    

}
    
    return color;
}










