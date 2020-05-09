
//----------------------------------------------------------------------------------------------------------------------
// Scene Definitions
//----------------------------------------------------------------------------------------------------------------------
// Both a local and a global scene are defined here.
// Each scene has two types of members: lights and objects
// The local scene also has a function to "teleport the light back"





//----------------------------------------------------------------------------------------------------------------------
// Local Scene
//----------------------------------------------------------------------------------------------------------------------

//Local Light Positions----------------------------------------
float localSceneLights(vec4 p){
    return sphereSDF(p, localLightPos, lightRad);
}


//For an example of changing SDFs in a Menu, there are two choices for local scene here, and a function which selects between them based on input through the UI carried to glsl via a uniform.

//Local Objects Choice 1
float tilingSceneSDF(vec4 p){
    vec4 center = vec4(0., 0., 0., 1.);
        float sphere=0.;
        sphere = sphereSDF(p, center, 0.7);
        return -sphere;
}

//Local Objects Choice 2
float latticeSceneSDF(vec4 p){
       
    vec3 q=vec3(abs(p.x),abs(p.y),abs(p.z));
    return max(q.x, max(q.y, q.z)) - 0.15 + dot(q, q)*0.5;
    // vec4 center = vec4(0., 0., 0., 1.);
   // return sphereSDF(p,center,0.2);
       // return fatEllipsoidSDF(p, center, 0.06);
}



//Function which picks which Local Objects to draw based on a uniform
float locSceneObjects(vec4 p){
    if(display==1){
        return tilingSceneSDF(p);
    }
    if(display==2){
        return latticeSceneSDF(p);
    }
}


// LOCAL OBJECTS SCENE SDF ++++++++++++++++++++++++++++++++++++++++++++++++

float localSceneSDF(vec4 p){
    float lightDist;
    float sceneDist;
    float distance = MAX_DIST;

    lightDist=localSceneLights(p);
    distance=min(distance, lightDist);
    
    if (lightDist < EPSILON){
        //LIGHT=true;
        
        hitWhich = 1;
        
        colorOfLight=vec3(0.3,0.3,0.3);
        return lightDist;
    }

    
    sceneDist=locSceneObjects(p);
    distance = min(distance, sceneDist);
    
        if (sceneDist<EPSILON){
            hitWhich=3;
            return sceneDist;
        }


    return distance;
}






// TELEPORT BACK TO CENTRAL CELL ++++++++++++++++++++++++++++++++++++++++++++++++

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














//----------------------------------------------------------------------------------------------------------------------
// Global Scene
//----------------------------------------------------------------------------------------------------------------------
//Again the global scene comes in two parts, the lights and the objects.
//These are then assembled into a single globalSDF



//Global Light Positions----------------------------------------











//Global Objects----------------------------------------
 float globalSceneObjects(vec4 p){
     vec4 center = vec4(0., 0.2, 0.3, 1.);
        return sphereSDF(p, center, 0.1);
 }




//Global Scene SDF----------------------------------------
// measures distance from cellBoost * p to an object in the global scene

float globalSceneSDF(vec4 p){
    // correct for the fact that we have been moving
    vec4 absolutep = translate(cellBoost, p);
    float distance = MAX_DIST;
    float globalSceneDist;
    
    //Light Objects
    for (int i=0; i<4; i++){
        float objDist;
        objDist = sphereSDF(
        absolutep,
        lightPositions[i],
        0.2//radius of the light
        );
        distance = min(distance, objDist);
        if (distance < EPSILON){
            hitWhich = 1;
            colorOfLight = lightIntensities[i].xyz;//color of the light
            return distance;
        }
    }
    
    
    //Global Sphere Object
    globalSceneDist=globalSceneObjects(absolutep);
    distance = min(distance, globalSceneDist);
    
        if (globalSceneDist<EPSILON){
            hitWhich=2;
            return globalSceneDist;
        }


    return distance;

    // return MAX_DIST;
}


