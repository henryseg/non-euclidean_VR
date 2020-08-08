//----------------------------------------------------------------------------------------------------------------------
// GEOM DEPENDENT
//----------------------------------------------------------------------------------------------------------------------


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

    if (hitWhich != 3){
        // little hack, otherwise the shader collaspe when there are too many objets in the scene.
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
    else { //local scene
        n = createVector(p, vec3(
        localSceneSDF(shiftPX) - localSceneSDF(shiftMX),
        localSceneSDF(shiftPY) - localSceneSDF(shiftMY),
        localSceneSDF(shiftPZ) - localSceneSDF(shiftMZ)
        ));
    }
    n = tangNormalize(n);
    return n;
}











//----------------------------------------------------------------------------------------------------------------------
//Geometry of the Models
//----------------------------------------------------------------------------------------------------------------------

/*
TODO. Check if needed in general ? Geometry dependent ?
*/

//project point back onto the geometry
Point geomProject(Point p){
    return p;
}

//Project onto the Klein Model
Point modelProject(Point p){
    return p;

}

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


//EARTH TEXTURING COLOR COMMANDS

// return the two smallest numbers in a triplet
vec2 smallest(vec3 v)
{
    float mi = min(v.x, min(v.y, v.z));
    float ma = max(v.x, max(v.y, v.z));
    float me = v.x + v.y + v.z - mi - ma;
    return vec2(mi, me);
}

/*
// texture a 4D surface by doing 4 2D projections in the most
// perpendicular possible directions, and then blend them
// together based on the surface normal
// TODO. Check with Steve how to make this part geometry independent.
vec3 boxMapping(sampler2D sam, Vector point)
{ // from Inigo Quilez
    vec4 m = point.dir * point.dir; m=m*m; m=m*m;

    vec3 x = texture(sam, smallest(point.pos.yzw)).xyz;
    vec3 y = texture(sam, smallest(point.pos.zwx)).xyz;
    vec3 z = texture(sam, smallest(point.pos.wxy)).xyz;
    vec3 w = texture(sam, smallest(point.pos.xyz)).xyz;

    return (x*m.x + y*m.y + z*m.z + w*m.w)/(m.x+m.y+m.z+m.w);
}

// TODO. Rémi: not sure what it does.
vec3 sphereOffset(Isometry globalObjectBoost, vec4 pt){
    pt = translate(cellBoost, pt);
    Isometry aux = makeInvLeftTranslation(globalObjectBoostMat);
    pt = translate(aux, pt);
    return tangDirection(ORIGIN, pt).global_dir.xyz;
}*/

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
    Point samplePos=modelProject(sampletv.pos);

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
    x = 0.9 * x / modelHalfCube;
    y = 0.9 * y / modelHalfCube;
    z = 0.9 * z / modelHalfCube;
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

