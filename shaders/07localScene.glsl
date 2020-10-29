


//----------------------------------------------------------------------------------------------------------------------
// Local Lighting
//----------------------------------------------------------------------------------------------------------------------

//Local Light Positions----------------------------------------
//float localSceneLights(vec4 p){
//    //this just draws one copy of the local light.
//    //no problem if the light stays in a fundamental domain the whole time.
//    //if light is moving between domains; is more useful to draw thee six neighbors as well, much  like is done for the local sphere object centered on you, below.
//    
//    return min(sphereSDF(p, localLightPos, 0.05),sphereSDF(p,localLightPos2,0.05)); //below makes lights change radius in proportion to brightness
//                     //lightRad);
//    
//}


//Local Light Positions----------------------------------------
float localSceneLights(vec4 p, float threshhold){
    //right now there are four lights, so we run through all of them
   
    float distance=MAX_DIST;
    
       for (int i=0; i<4; i++){
        float lightDist;
        lightDist = sphereSDF(p,localLightPosition[i],0.05//radius of the light
        );
           
        distance = min(distance, lightDist);
        if (distance < threshhold){
            hitLocal=true;
            hitWhich = 1;
            colorOfLight = (vec3(1.,1.,1.)+lightIntensities[i].xyz)/2.;//color of the light
            return distance;
        }
    }
    
    return distance;
    
}

//for the default threshhold value
float localSceneLights(vec4 p){
    return  localSceneLights(p, EPSILON);
}


//----------------------------------------------------------------------------------------------------------------------
// Local Scene Objects
//----------------------------------------------------------------------------------------------------------------------

float locSphere(vec4 p){
    //want to draw a single sphere: but the problem is, that when  you  move  around it passes through a wall of the fundamental  domain and gets all noisey for a second.
    //solution: draw six images of the thing surrounding your central cube; most of the time they'll be overrlapping but when it crosses a fundamental domain wall this will  fix the issue.
    
    vec4 objPos;
    float sphDist;
    
    float dist=sphereSDF(p,currentPos,yourRad);
    
    for (int i=0; i<6; i++) {//
        objPos=translate(invGenerators[i],currentPos);
        sphDist=sphereSDF(p,objPos, yourRad);
        dist=min(sphDist,dist);
    }
    
    return dist;
    
}













//----------------------------------------------------------------------------------------------------------------------
// Local Scene Tiling
//----------------------------------------------------------------------------------------------------------------------


//There are three choices of local tiling SDFs here; it is possible to switch between them via the uniform "display"


//
//float antipodeDist(vec4 p, vec4 q,float rad){
//
//    
//    float d=cSDF(p,q,rad);
//
//    return min(d,3.14-d);
//}


float antipodeDist(vec4 p, vec4 q,float rad){
    vec4 q2=vec4(-q.x,-q.y,-q.z,q.w);
    return min(sphereSDF(p,q,rad),sphereSDF(p,q2,rad));
}


float circPermutationDist(vec4 p, vec4 q, float rad){
    vec4 q2=vec4(p.z,p.x,p.y,p.w);
    vec4 q3=vec4(p.y,p.z,p.x,p.w);
    float dist=min(sphereSDF(p,q,rad),sphereSDF(p,q2,rad));
    dist=min(dist,sphereSDF(p,q3,rad));
    return dist;
}

//minimize distance over antipodes and circular permutations
float antiPermDist(vec4 p, vec4 q, float rad){
    float dist1=circPermutationDist(p,q,rad);
    vec4 q2=vec4(-q.x,-q.y,-q.z,q.w);
    float dist2=circPermutationDist(p,q2,rad);
    return min(dist1,dist2);
}

//Local Objects Choice 1
float tilingSceneSDF(vec4 p){
float dist=100.;

    //can use combos of permutations and antipodes to get all the vertices
    float rad=0.6;
    float rad2=0.63;
    

//    //all the pm 1 vertices
//    float dist1=antipodeDist(p,v1,rad);
//    float dist2=antiPermDist(p,v2,rad);
//
//    float dist3=antiPermDist(p,v3,rad);
//    float dist4=antiPermDist(p,v4,rad);
//    
//    return min(min(dist1,dist2),min(dist3,dist4));
//    
    
//    float dist=antipodeDist(p,v1,rad);
//    dist=min(dist,antipodeDist(p,v2,rad));
//    dist=min(dist,antipodeDist(p,v21,rad));
//    dist=min(dist,antipodeDist(p,v22,rad));
//    dist=min(dist,antipodeDist(p,v3,rad));
//    dist=min(dist,antipodeDist(p,v31,rad));
//    dist=min(dist,antipodeDist(p,v32,rad));
//    dist=min(dist,antipodeDist(p,v4,rad));
//    dist=min(dist,antipodeDist(p,v41,rad));
//    dist=min(dist,antipodeDist(p,v42,rad));
    
 dist=min(dist,antipodeDist(p,w1,rad2)); 
 dist=min(dist,antipodeDist(p,w2,rad2));
 dist=min(dist, antipodeDist(p,w3,rad2));
   dist=min(dist, antipodeDist(p,w4,rad2));
  dist=min(dist, antipodeDist(p,w5,rad2));
  dist=min(dist, antipodeDist(p,w6,rad2));
    
 
//    //subtract balls from slab
    //dist=smax(-dist,abs(p.w)-0.2,0.1);
//    
    
    return  -dist;
}












//----------------------------------------------------------------------------------------------------------------------
// Local Scene SDF
//----------------------------------------------------------------------------------------------------------------------



float localSceneSDF(vec4 p,float threshhold){

    float distance = MAX_DIST;


    distance=tilingSceneSDF(p);
   
        if (distance<threshhold){
            hitLocal=true;
            hitWhich=3;
            
            return distance;
        }


    return distance;
}


//an overloading of the above for the default threshhold EPSILON
float localSceneSDF(vec4 p){
    return localSceneSDF(p, EPSILON);
}







