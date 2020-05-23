//EARTH TEXTURING COLOR COMMANDS


// return the two smallest numbers in a triplet
vec2 smallest( in vec3 v )
{
    float mi = min(v.x,min(v.y,v.z));
    float ma = max(v.x,max(v.y,v.z));
    float me = v.x + v.y + v.z - mi - ma;
    return vec2(mi,me);
}

// texture a 4D surface by doing 4 2D projections in the most
// perpendicular possible directions, and then blend them
// together based on the surface normal
vec3 boxMapping( in sampler2D sam, in tangVector point )
{  // from Inigo Quilez
    vec4 m = point.dir*point.dir; m=m*m; m=m*m;

    vec3 x = texture( sam, smallest(point.pos.yzw) ).xyz;
    vec3 y = texture( sam, smallest(point.pos.zwx) ).xyz;
    vec3 z = texture( sam, smallest(point.pos.wxy) ).xyz;
    vec3 w = texture( sam, smallest(point.pos.xyz) ).xyz;

    return (x*m.x + y*m.y + z*m.z + w*m.w)/(m.x+m.y+m.z+m.w);
}

vec3 sphereOffset(mat4 objectFacing, vec4 pt){
   
    pt = inverse(localEarthBoost)*pt;
    tangVector earthPoint=tangDirection(ORIGIN,pt);
    earthPoint=rotateFacing(objectFacing, earthPoint);
    return earthPoint.dir.xyz;
}

vec3 globalSphereOffset(mat4 objectFacing, vec4 pt){
   
    pt = cellBoost*inverse(globalEarthBoost)*pt;
    tangVector earthPoint=tangDirection(ORIGIN,pt);
    earthPoint=rotateFacing(objectFacing, earthPoint);
    return earthPoint.dir.xyz;
}

vec3 globalSphereTexture(mat4 totalFixMatrix, tangVector sampletv, samplerCube sphTexture){
    
    // vec3 color = vec3(0.5,0.5,0.5);
    vec3 color = texture(sphTexture, globalSphereOffset( localEarthFacing, sampletv.pos)).xyz;
    // color = 0.5*color + 0.5*vec3(float(stepsTaken)*0.1, float(stepsTaken-10)*0.1, float(stepsTaken-20)*0.1);
    // N = estimateNormal(sampletv.pos);
     vec3 color2 = phongModel(totalFixMatrix, color);
    color = 0.9*color+0.1;
     return 0.2*color + 0.8*color2;
    return color;
    }

vec3 sphereTexture(mat4 totalFixMatrix, tangVector sampletv, samplerCube sphTexture){
    
    // vec3 color = vec3(0.5,0.5,0.5);
    vec3 color = texture(sphTexture, sphereOffset( localEarthFacing, sampletv.pos)).xyz;
    // color = 0.5*color + 0.5*vec3(float(stepsTaken)*0.1, float(stepsTaken-10)*0.1, float(stepsTaken-20)*0.1);
    // N = estimateNormal(sampletv.pos);
     vec3 color2 = phongModel(totalFixMatrix, color);
    color = 0.9*color+0.1;
     return 0.2*color + 0.8*color2;
    return color;
    }
