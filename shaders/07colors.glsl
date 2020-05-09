//----------------------------------------------------------------------------------------------------------------------
// LIGHT
//----------------------------------------------------------------------------------------------------------------------
//light intensity as a fn of distance
float lightAtt(float dist){
    if (FAKE_LIGHT_FALLOFF){
        //fake linear falloff
        return 1.+0.5*dist+0.1*dist*dist;
    }
    //actual distance function
    return 0.1+surfArea(dist);
}











//NORMAL FUNCTIONS ++++++++++++++++++++++++++++++++++++++++++++++++++++
//Given a point in the scene where you stop raymarching as you have hit a surface, find the normal at that point
tangVector estimateNormal(vec4 p) { 
    float newEp = EPSILON * 10.0;
    //basis for the tangent space at that point.
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
// Lighting Functions
//----------------------------------------------------------------------------------------------------------------------
//SP - Sample Point | TLP - Translated Light Position | V - View Vector
vec3 lightingCalculations(vec4 SP, vec4 TLP, tangVector V, vec3 baseColor, vec4 lightColor, float lightIntensity){
    //Calculations - Phong Reflection Model
    
    //this is the direction from point on surface to the light source
    tangVector L = tangDirection(SP, TLP);
    //this  is the reflection of this direction with respect to the surface normal
    tangVector R = sub(scalarMult(2.0 * cosAng(L, N), N), L);
    //Calculate Diffuse Component
    float nDotL = max(cosAng(N, L), 0.0);
    vec3 diffuse = lightColor.rgb * nDotL;
    //Calculate Specular Component
    float rDotV = max(cosAng(R, V), 0.0);
    vec3 specular = lightColor.rgb * pow(rDotV,20.0);
    //Attenuation - Of the Light Intensity
    float distToLight = fakeDistance(SP, TLP);
    float att = lightIntensity /lightAtt(distToLight);
    //Combine the above terms to compute the final color
    return (baseColor*(diffuse + .15) + vec3(.8, .6, .3)*specular*2.) * att;
   //return att*((diffuse*baseColor) + specular);
}






vec3 phongModel(Isometry totalFixMatrix, vec3 color){
    //sample point on the surfaxe
    vec4 SP = sampletv.pos;
    vec4 TLP;//translated light position
    //tangent vector at sample point pointing back at viewer
    tangVector V = tangVector(SP, -sampletv.dir);

    //intrinsic color of the surface
    //vec3 surfColor=color;
    //set here to be the input color, whitened a bit
    vec3 surfColor=0.2*vec3(1.)+0.8*color;

    //--------------------------------------------------
    //Lighting Calculations
    //--------------------------------------------------

    //GLOBAL LIGHTS
    for (int i = 0; i<4; i++){
        //for each global light, translate its position via fixMatrix and cellBost
        Isometry totalIsom=composeIsometry(totalFixMatrix, invCellBoost);
        TLP = translate(totalIsom, lightPositions[i]);
        //run the lighting calculation for this  light position
        //add the resulting color to the original.
        color += lightingCalculations(SP, TLP, V, surfColor, lightIntensities[i],2.);//the two here is the light intensity hard coded right now
    }

    //LOCAL LIGHT
    surfColor+= lightingCalculations(SP, localLightPos, V, surfColor, localLightColor,0.5+10.*lightRad*lightRad);
    //light color and intensity hard coded in


    //move local light around by the generators to pick up lighting from nearby cells
    for (int i=0; i<6; i++){
        TLP=invGenerators[i]*localLightPos;
        //local lights intensity is a function of its radius: so it gets brighter when it grows:
        color+= lightingCalculations(SP, TLP, V, surfColor, localLightColor,0.5+10.*lightRad*lightRad);
    }
    
    
    
    //now that we've done the lighting calculation; can do the other things that might be usefu; like adding fog
    //this creates fog whose thickness depends on the distance marched (as a fraction of MAX_DIST)
    //the FACTOR OF 20 HERE IS JUST EXPERIMENTAL RIGHT NOW: looks like we are never reaching max dist before iteration time runs out in Euclidean geometry
    float fogF = smoothstep(0., MAX_DIST/20., distToViewer);
    //    // Applying the background fog. Just black, in this case, but you could
    // the vec3(0.1) is the backgroud dark gray that is drawn when we hit nothing: so making  the fog limit to this makes objects fade out
    color = mix(color, vec3(0.1,0.1,0.1), fogF); 

    return color;
}


















vec3 tilingColor(Isometry totalFixMatrix, tangVector sampletv){
    //    if (FAKE_LIGHT){//always fake light in Sol so far

    //make the objects have their own color
    //color the object based on its position in the cube
    vec4 samplePos=modelProject(sampletv.pos);
//
//    //IF WE HIT THE TILING
    float x=samplePos.x;
    float y=samplePos.y;
    float z=samplePos.z;
    x = .9 * x/3.;
    y = .9 * y/3.;
    z = .9 * z/3.;
    vec3 color = vec3(x, y, z);
//    
    //fix a color for the tiling
    //vec3 color=vec3(0.2,0.3,0.5);

    //it seems like a negative sign has to go in here on the tangent vector
    //to make the shading right, as we are deleting the sphere to make the tiling and need an outward normal
    //need to actually check this when I clean up this part
    //N = turnAround(estimateNormal(sampletv.pos));
    N = estimateNormal(sampletv.pos);
    color = phongModel(totalFixMatrix, 0.3*color);

    return color;

}







































//EARTH TEXTURING COLOR COMMANDS

// return the two smallest numbers in a triplet
vec2 smallest(in vec3 v)
{
    float mi = min(v.x, min(v.y, v.z));
    float ma = max(v.x, max(v.y, v.z));
    float me = v.x + v.y + v.z - mi - ma;
    return vec2(mi, me);
}

// texture a 4D surface by doing 4 2D projections in the most
// perpendicular possible directions, and then blend them
// together based on the surface normal
vec3 boxMapping(in sampler2D sam, in tangVector point)
{ // from Inigo Quilez
    vec4 m = point.dir*point.dir; m=m*m; m=m*m;

    vec3 x = texture(sam, smallest(point.pos.yzw)).xyz;
    vec3 y = texture(sam, smallest(point.pos.zwx)).xyz;
    vec3 z = texture(sam, smallest(point.pos.wxy)).xyz;
    vec3 w = texture(sam, smallest(point.pos.xyz)).xyz;

    return (x*m.x + y*m.y + z*m.z + w*m.w)/(m.x+m.y+m.z+m.w);
}

vec3 sphereOffset(Isometry globalObjectBoost, vec4 pt){
    pt = translate(cellBoost, pt);
    pt = inverse(globalObjectBoost.matrix) * pt;
    return tangDirection(ORIGIN, pt).dir.xyz;
}


vec3 lightColor(Isometry totalFixMatrix, tangVector sampletv, vec3  colorOfLight){

    N = estimateNormal(sampletv.pos);
    vec3 color;
    color = phongModel(totalFixMatrix, colorOfLight);
    color = 0.7*color+0.4;
    return color;

}



vec3 ballColor(Isometry totalFixMatrix, tangVector sampletv){
    if (EARTH){
        N = estimateNormal(sampletv.pos);
        vec3 color = texture(earthCubeTex, sphereOffset(globalObjectBoost, sampletv.pos)).xyz;
        vec3 color2 = phongModel(totalFixMatrix, color);
        //color = 0.9*color+0.1;
        return 0.5*color + 0.5*color2;
    }
    else {

        N = estimateNormal(sampletv.pos);
        vec3 color=vec3(0.5,0.2,0.1);
        color = phongModel(totalFixMatrix, 0.9*color);
        color = 0.9*color+0.1;
        return color;


        //generically gray object (color= black, glowing slightly because of the 0.1)
    }
}


