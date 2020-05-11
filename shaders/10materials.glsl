


















vec3 tilingColor(Isometry totalFixMatrix, tangVector sampletv){
    //    if (FAKE_LIGHT){//always fake light in Sol so far

    //make the objects have their own color
    //color the object based on its position in the cube
   vec4 samplePos=modelProject(sampletv.pos);
////
////    //IF WE HIT THE TILING
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
    
    
    
    
//        //TRY SHADOWS
//    //calculate the position of the new lightsource (will need to collect this and make it a uniform...)
//        vec4 newLightPos=currentBoostMat*ORIGIN+vec4(0.05,0.05,0.05,0.);
//    
//    //calculate the shadow given sample point on surface, normal directoin, and light soure.
//    float sh = softShadow(sampletv.pos + 0.0015*N.dir, newLightPos, 30.);
//    
//    //add in the effect of the shadow
//    //color=sh*color;
//    
//    
    
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
//return vec3(1.);//pure white as test
    N = estimateNormal(-sampletv.pos);
    vec3 color;
    color = phongModel(totalFixMatrix, colorOfLight);
    color = color+vec3(0.5);
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













//----------------------------------------------------------------------------------------------------------------------
// DECIDING MATERIALS IN THE RAYMARCH
//----------------------------------------------------------------------------------------------------------------------


//do the raymarch, then depending on what you hit figure out the color:
vec4 marchedColor(int hitWhich, Isometry totalFixMatrix, tangVector sampletv){

    
     //Based on hitWhich decide whether we hit a global object, local object, or nothing
    if (hitWhich == 0){ //Didn't hit anything ------------------------
        //COLOR THE FRAME DARK GRAY
        //0.2 is medium gray, 0 is black
        return vec4(0.1);
    }
    else if (hitWhich == 1){
        // lights
        vec3 pixelColor= lightColor(totalFixMatrix, sampletv, colorOfLight);
        return vec4(pixelColor, 1.0);
    }
    else if (hitWhich == 5){
        //debug
        return vec4(debugColor, 1.0);
    }
    else if (hitWhich == 2){
        // global object
        vec3 pixelColor= ballColor(totalFixMatrix, sampletv);
        return vec4(pixelColor, 1.0);

    }
    else if (hitWhich ==3) {
        // local objects
        //vec3 pixelColor=vec3(20.*distToViewer/MAX_DIST,0.,0.);
        vec3 pixelColor= tilingColor(totalFixMatrix, sampletv);
        return vec4(pixelColor, 1.0);

    }

    
}
