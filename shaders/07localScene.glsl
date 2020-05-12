


//----------------------------------------------------------------------------------------------------------------------
// Local Lighting
//----------------------------------------------------------------------------------------------------------------------

//Local Light Positions----------------------------------------
float localSceneLights(vec4 p){
    
    return sphereSDF(p, localLightPos, 0.05); //below makes lights change radius in proportion to brightness
                     //lightRad);
}







//----------------------------------------------------------------------------------------------------------------------
// Local Scene Objects
//----------------------------------------------------------------------------------------------------------------------


//There are three choices of local tiling SDFs here; it is possible to switch between them via the uniform "display"

//Local Objects Choice 1
float tilingSceneSDF(vec4 p){
    vec4 center = vec4(0., 0., 0., 1.);
        float sphere=0.;
        sphere = sphereSDF(p, center, 0.68);
        return -sphere;
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
    vec4 center = vec4(0., 0., 0., 1.);
    return sphereSDF(p,center,0.2);
// return fatEllipsoidSDF(p, center, 0.06);
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
    float lightDist;
    float sceneDist;
    float distance = MAX_DIST;

//you are the lightsource, so this will draw a ball around you.  BUT- in the raymarcher we have a  "bubble" around oruselves that  we skip before marching, so we don't see this one, only its other images.
    lightDist=localSceneLights(p);
    distance=min(distance, lightDist);
    
    if (distance < threshhold){
        isLocal=1;
        hitWhich = 1;
        colorOfLight=vec3(.5,.5,1.);
        
        
        return distance;
    }

    //distance to scene is minimum of the objects and the bubble around the viewer
    //sceneDist=max(viewerBubble(p),localSceneObjects(p));
    sceneDist=localSceneObjects(p);
    distance = min(distance, sceneDist);
    
        if (sceneDist<threshhold){
            isLocal=1;
            hitWhich=3;
            return sceneDist;
        }


    return distance;
}


//an overloading of the above for the default threshhold EPSILON
float localSceneSDF(vec4 p){
    return localSceneSDF(p, EPSILON);
}










//----------------------------------------------------------------------------------------------------------------------
// Teleporting Back to Central Cell when raymarching the local scene
//----------------------------------------------------------------------------------------------------------------------


// check if the given point p is in the fundamental domain of the lattice.
// if it is not, then use one of the generlators to translate it back

bool isOutsideCell(vec4 p, out Isometry fixMatrix){
    //vec4 ModelP= modelProject(p);
    
    //lattice basis divided by the norm square
 //right now norm square is 1 so haven't put that in yet.
    vec4 v1 = V1;
    vec4 v2 = V2;
    vec4 v3 = V3;

    //right now this turns off the vertical translation generators for rendering the "plane" scene.  Need a better way of doing this in general, to be able to turn off some at will.
    //if (display!=2){
        if (dot(p, v3) > 0.5) {
            fixMatrix = Isometry(invGenerators[4]);
            return true;
        }
        if (dot(p, v3) < -0.5) {
            fixMatrix = Isometry(invGenerators[5]);
            return true;
        }
   // }

    if (dot(p, v1) > 0.5) {
        fixMatrix = Isometry(invGenerators[0]);
        return true;
    }
    if (dot(p, v1) < -0.5) {
        fixMatrix = Isometry(invGenerators[1]);
        return true;
    }
    if (dot(p, v2) > 0.5) {
        fixMatrix = Isometry(invGenerators[2]);
        return true;
    }
    if (dot(p, v2) < -0.5) {
        fixMatrix = Isometry(invGenerators[3]);
        return true;
    }
    return false;
}


// overload of the previous method with tangent vector
bool isOutsideCell(tangVector v, out Isometry fixMatrix){
    return isOutsideCell(v.pos, fixMatrix);
}


// overload of the previous method with local tangent vector
bool isOutsideCell(localTangVector v, out Isometry fixMatrix){
    return isOutsideCell(v.pos, fixMatrix);
}






