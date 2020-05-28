


//----------------------------------------------------------------------------------------------------------------------
// Local Lighting
//----------------------------------------------------------------------------------------------------------------------

//Local Light Positions----------------------------------------
float localSceneLights(vec4 p){
    //this just draws one copy of the local light.
    //no problem if the light stays in a fundamental domain the whole time.
    //if light is moving between domains; is more useful to draw thee six neighbors as well, much  like is done for the local sphere object centered on you, below.
    float L1;
    float L2;
    float L3;
    L1=sphereSDF(p, localLightPosition, 0.02);
    L2=sphereSDF(p, localLight2, 0.02);
    L3=sphereSDF(p, localLight3, 0.02);
    return min(L1,min(L2,L3)); //below makes lights change radius in proportion to brightness
                     //lightRad);
    
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
    
    for (int i=0; i<12; i++) {
        objPos=invGenerators[i]*currentPos;
        sphDist=sphereSDF(p,objPos, yourRad);
        dist=min(sphDist,dist);
    }
    
    return dist;
    
}













//----------------------------------------------------------------------------------------------------------------------
// Local Scene Tiling
//----------------------------------------------------------------------------------------------------------------------


//There are three choices of local tiling SDFs here; it is possible to switch between them via the uniform "display"

//Local Objects Choice 1
float tilingSceneSDF(vec4 p){
//center sphere shaped hole
    float centerHole=sphereSDF(p,ORIGIN,0.35);
    //return -centerHole;
//corner of ideal cube in S3:
    //vec4 corner=vec4(0.5,0.5,0.5,0.5);
   // float cornerHole=sphereSDF(abs(p),corner,0.28);
   // return -min(centerHole, cornerHole);
    return -centerHole;
}

//Local Objects Choice 2
float cylSceneSDF(vec4 p){
       
   // vec3 q=vec3(abs(p.x),abs(p.y),abs(p.z));
   //return max(q.x, max(q.y, q.z)) - 0.15 + dot(q, q)*0.5;
    
 vec4 center = vec4(0., 0., 0., 1.);
    float cylZ=cylSDF(p,0.1);
    float cylY =cylSDF(vec4(p.x,p.z,p.y,1.),0.1);
    float cylX =cylSDF(vec4(p.y,p.z,p.x,1.),0.1);
   return min(min(cylZ,cylY),cylX);
    
    
    //return sphereSDF(p,ORIGIN,0.02);
       // return fatEllipsoidSDF(p, center, 0.06);
}


//Local Objects Choice 3
float latticeSceneSDF(vec4 p){
       
   // vec3 q=vec3(abs(p.x),abs(p.y),abs(p.z));
   //return max(q.x, max(q.y, q.z)) - 0.15 + dot(q, q)*0.5;
    
    return sphereSDF(p,ORIGIN,0.5);
  

}


//Function which picks which Local Objects to draw based on a uniform
float localSceneObjects(vec4 p){
    if(display==1){
        return tilingSceneSDF(p);
    }
    if(display==2){
        return cylSceneSDF(p);
    }
        if(display==3){
        return latticeSceneSDF(p);
    }
}












//----------------------------------------------------------------------------------------------------------------------
// Local Scene SDF
//----------------------------------------------------------------------------------------------------------------------



float localSceneSDF(vec4 p,float threshhold){
    float lightDist;//lightsource
    float sceneDist;//tiling
    float objDist;//little ball
    float distance = MAX_DIST;

//you are the lightsource, so this will draw a ball around you.  BUT- in the raymarcher we have a  "bubble" around oruselves that  we skip before marching, so we don't see this one, only its other images.
    //lightDist=localSceneLights2(p);
    lightDist=sphereSDF(p, localLightPosition, 0.02);
    distance=min(distance, lightDist);
    
    if (distance < threshhold){
        hitLocal=true;
        hitWhich = 1;
        colorOfLight=vec3(68./ 256., 197./ 256., 203. / 256.);
        
        return distance;
    }
    
    
    lightDist=sphereSDF(p, localLight2, 0.02);
    distance=min(distance, lightDist);
    
    if (distance < threshhold){
        hitLocal=true;
        hitWhich = 1;
        colorOfLight=vec3(252. / 256., 227. / 256., 21. / 256.);
        
        return distance;
    }
    
    
    lightDist=sphereSDF(p, localLight3, 0.02);
    distance=min(distance, lightDist);
    
    if (distance < threshhold){
        hitLocal=true;
        hitWhich = 1;
        colorOfLight=vec3(245. / 256., 61. / 256., 82. / 256.);
        
        return distance;
    }

    //distance to scene is minimum of the objects and the bubble around the viewer
    //sceneDist=max(viewerBubble(p),localSceneObjects(p));
    sceneDist=localSceneObjects(p);
    distance = min(distance, sceneDist);
    
        if (sceneDist<threshhold){
            hitLocal=true;
            hitWhich=3;
            
            return sceneDist;
        }

    
    if(yourRad>0.001){
    //now do the same thing for the object
    objDist=locSphere(p);
    distance = min(distance, objDist);
    
        if (objDist<threshhold){
            hitLocal=true;
            hitWhich=4;
            
            return objDist;
        }
    }


    return distance;
}


//an overloading of the above for the default threshhold EPSILON
float localSceneSDF(vec4 p){
    return localSceneSDF(p, EPSILON);
}







