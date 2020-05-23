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




vec3 localColor(mat4 totalFixMatrix, tangVector sampletv){
    N = estimateNormal(sampletv.pos);
    vec3 color=vec3(0., 0., 0.);
    color = phongModel(totalFixMatrix, color);
    color = 0.9*color+0.1;
    return color;
    //generically gray object (color= black, glowing slightly because of the 0.1)
}


vec3 globalColor(mat4 totalFixMatrix, tangVector sampletv){
    if (SURFACE_COLOR){ //color the object based on its position in the cube
        vec4 samplePos=modelProject(sampletv.pos);
        //Point in the Klein Model unit cube    
        float x=samplePos.x;
        float y=samplePos.y;
        float z=samplePos.z;
        x = 0.9*x/modelHalfCube;
        y = 0.9*y/modelHalfCube;
        z = -0.9*z/modelHalfCube;
        vec3 color = vec3(x, y, z);
        N = estimateNormal(sampletv.pos);
        color = phongModel(totalFixMatrix, 0.175*color);
        return 0.9*color+0.1;
        //adding a small constant makes it glow slightly
    }
    else {
        // objects
        N = estimateNormal(sampletv.pos);
        vec3 color=vec3(0., 0., 0.);
        color = phongModel(totalFixMatrix, color);
        return color;
    }
}



