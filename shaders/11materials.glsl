


//EARTH TEXTURING COLOR COMMANDS

//// return the two smallest numbers in a triplet
//vec2 smallest(in vec3 v)
//{
//    float mi = min(v.x, min(v.y, v.z));
//    float ma = max(v.x, max(v.y, v.z));
//    float me = v.x + v.y + v.z - mi - ma;
//    return vec2(mi, me);
//}
//
//// texture a 4D surface by doing 4 2D projections in the most
//// perpendicular possible directions, and then blend them
//// together based on the surface normal
//vec3 boxMapping(in sampler2D sam, in tangVector point)
//{ // from Inigo Quilez
//    vec4 m = point.dir*point.dir; m=m*m; m=m*m;
//
//    vec3 x = texture(sam, smallest(point.pos.yzw)).xyz;
//    vec3 y = texture(sam, smallest(point.pos.zwx)).xyz;
//    vec3 z = texture(sam, smallest(point.pos.wxy)).xyz;
//    vec3 w = texture(sam, smallest(point.pos.xyz)).xyz;
//
//    return (x*m.x + y*m.y + z*m.z + w*m.w)/(m.x+m.y+m.z+m.w);
//}

vec3 sphereOffset(Isometry globalObjectBoost, vec4 pt){
    pt = translate(cellBoost, pt);
    pt = inverse(globalObjectBoost.matrix) * pt;
    return tangDirection(ORIGIN, pt).dir.xyz;
}


vec3 earthColor(Isometry totalFixMatrix, tangVector sampletv){
        surfNormal = surfaceNormal(sampletv);
        vec3 color = texture(earthCubeTex, sphereOffset(globalObjectBoost, sampletv.pos)).xyz;
       // vec3 color2 = lightingCalculations(totalFixMatrix, color);
       // return 0.5*color + 0.5*color2;
    return color;
    }
















//given the value of hitWhich, decide the initial color assigned to the surface you hit, before any lighting calculations
//in the future, this function will also contain more data, like its rerflectivity etc

vec3 materialColor(int hitWhich){
    
    if (hitWhich == 0){ //Didn't hit anything ------------------------
        //COLOR THE FRAME DARK GRAY
        //0.2 is medium gray, 0 is black
    return vec3(0.1);
    }
    else if (hitWhich == 1){//lightsource
        // in this case, either in the local or global scene sdf, when the threshhold was triggered, they automatically set colorOfLight correctly
        //so, we can just return that value here
        return colorOfLight;
    }
    else if (hitWhich == 2){//localObject
        return vec3(0.,0.,0.);//black sphere
       // return earthColor(totalFixMatrix,sampletv);
        //earth textured sphere
    }
    else if (hitWhich ==3) {//local object
    //first option; some fixed color preturbed by your position in the colo cube a bit.
    //origColor=vec3(0.1,0.2,0.3)+(sampletv.pos.xyz+vec3(0.5,0.5,0.5))/8.;
    return vec3(0.1,0.2,0.35);//just some random constant blue color
    }
    else if (hitWhich ==3) {//tiling
    return vec3(0.,0.,0.);//black sphere
    }
    
}


float materialReflectivity(int hitWhich){
    
    if (hitWhich == 0){ //Didn't hit anything ------------------------
        //COLOR THE FRAME DARK GRAY
        //0.2 is medium gray, 0 is black
    return 0.;
    }
    else if (hitWhich == 1){//lightsource (loc or  global)
        return 0.2;
    }
    else if (hitWhich == 2){//global Object
        return 0.3;//black sphere
        //return 0.;//earth
    }
    else if (hitWhich ==3) {//tiling
    return mirror;//controlled by slider
    }
    else if (hitWhich ==4) {//local sphere object
    return 0.4;//shiny
    }
    
}













//
//vec3 ballColor(Isometry totalFixMatrix, tangVector sampletv){
//    if (EARTH){
//        surfNormal = surfaceNormal(sampletv);
//        vec3 color = texture(earthCubeTex, sphereOffset(globalObjectBoost, sampletv.pos)).xyz;
//        vec3 color2 = lightingCalculations(totalFixMatrix, color);
//        //color = 0.9*color+0.1;
//        return 0.5*color + 0.5*color2;
//    }
//    else {
//
//        surfNormal = surfaceNormal(sampletv);
//        vec3 color=vec3(0.5,0.2,0.1);
//        color = lightingCalculations(totalFixMatrix, 0.9*color);
//        color = 0.9*color+0.1;
//        return color;
//
//
//        //generically gray object (color= black, glowing slightly because of the 0.1)
//    }
//}
//




//
//
//
//
//vec3 newTilingColor(Isometry totalFixMatrix, tangVector sampletv){
//    //    if (FAKE_LIGHT){//always fake light in Sol so far
//
//    
//    N = surfaceNormal(sampletv);
//
//    
//    vec4 surfacePosition=sampletv.pos;//position on the surface of the sample point
//    tangVector toViewer=turnAround(sampletv);//tangent vector on surface pointing to viewer
//    tangVector toLight=tangDirection(surfacePosition, lightPosition);//tangent vector on surface pointing to light
//    float distToLight=exactDist(surfacePosition, lightPosition);//distance from sample point to light source
//    
//    vec3 baseColor = 2.*surfacePosition;
//    vec3 origSurf;
//    vec3 reflSurf;
//    vec3 color;
//    float shade;// a number between 0 and 1 representing proportion of shadow
//    vec3 phong;// the phong  model  addition to base color
//    
//    
//    phong=phongShading(toLight,toViewer,distToLight,baseColor,lightColor,2.);
//    shade=shadowMarch(toLight,distToLight);
//    
//    //color of original point on the  surface
//    origSurf=shade*phong;
//    
//    
//    //now calculate the  reflected points color
//    tangVector newDir = reflectOff(sampletv, N);
//    newDir=geoFlow(newDir,0.01);
//    reflectmarch(newDir, totalFixMatrix);
//    
//    
//    
//    
//    
//    
//    return color;
//    
//    
//    
//////    
//    //fix a color for the tiling
//   // vec3 color=vec3(0.1,0.1,0.3);
//
//    //it seems like a negative sign has to go in here on the tangent vector
//    //to make the shading right, as we are deleting the sphere to make the tiling and need an outward normal
//    //need to actually check this when I clean up this part
//    //N = turnAround(surfaceNormal(sampletv));
//    N = surfaceNormal(sampletv);
//    color = lightingCalculations(totalFixMatrix, 0.3*color);
//    
//    
//    
//    
////        //TRY SHADOWS
////    //calculate the position of the new lightsource (will need to collect this and make it a uniform...)
////        vec4 newLightPos=currentBoostMat*ORIGIN+vec4(0.05,0.05,0.05,0.);
////    
////    //calculate the shadow given sample point on surface, normal directoin, and light soure.
////    float sh = softShadow(sampletv.pos + 0.0015*N.dir, newLightPos, 30.);
////    
////    //add in the effect of the shadow
////    //color=sh*color;
////    
////    
//    
//    return color;
//
//}
//
//
//
//




















//
//
//
//vec3 tilingColor(Isometry totalFixMatrix, tangVector sampletv){
//    //    if (FAKE_LIGHT){//always fake light in Sol so far
//
//    //make the objects have their own color
//    //color the object based on its position in the cube
//   vec4 samplePos=modelProject(sampletv.pos);
//////
//////    //IF WE HIT THE TILING
//    float x=samplePos.x;
//    float y=samplePos.y;
//    float z=samplePos.z;
//    x = .9 * x/3.;
//    y = .9 * y/3.;
//    z = .9 * z/3.;
//    vec3 color = vec3(x, y, z);
//////    
//    //fix a color for the tiling
//   // vec3 color=vec3(0.1,0.1,0.3);
//
//    //it seems like a negative sign has to go in here on the tangent vector
//    //to make the shading right, as we are deleting the sphere to make the tiling and need an outward normal
//    //need to actually check this when I clean up this part
//    //N = turnAround(surfaceNormal(sampletv));
//    N = surfaceNormal(sampletv);
//    color = lightingCalculations(totalFixMatrix, 0.3*color);
//    
//    
//    
//    
////        //TRY SHADOWS
////    //calculate the position of the new lightsource (will need to collect this and make it a uniform...)
////        vec4 newLightPos=currentBoostMat*ORIGIN+vec4(0.05,0.05,0.05,0.);
////    
////    //calculate the shadow given sample point on surface, normal directoin, and light soure.
////    float sh = softShadow(sampletv.pos + 0.0015*N.dir, newLightPos, 30.);
////    
////    //add in the effect of the shadow
////    //color=sh*color;
////    
////    
//    
//    return color;
//
//}
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//vec3 lightColor(Isometry totalFixMatrix, tangVector sampletv, vec3  colorOfLight){
////return vec3(1.);//pure white as test
//    N = surfaceNormal(sampletv);
//    vec3 color;
//    color = lightingCalculations(totalFixMatrix, colorOfLight);
//    color = color+vec3(0.5);
//    return color;
//
//}
//
//
//
//
//
//
//
//
//
//
//


//
//
//
//
//
//
//



