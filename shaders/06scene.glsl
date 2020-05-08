
//----------------------------------------------------------------------------------------------------------------------
// Scene Definitions
//----------------------------------------------------------------------------------------------------------------------
// Turn off the local scene
// Local signed distance function : distance from p to an object in the local scene




float tilingSceneSDF(vec4 p){
    vec4 center = vec4(0., 0., 0., 1.);
        float sphere=0.;
        sphere = sphereSDF(p, center, 0.7);
        return -sphere;
}

float planeSceneSDF(vec4 p){
        vec4 center = vec4(0., 0., 0., 1.);
        return fatEllipsoidSDF(p, center, 0.05);
}


float locSceneChoice(vec4 p){
    if(display==1){
        return tilingSceneSDF(p);
    }
    if(display==2){
        return planeSceneSDF(p);
    }
}





// LOCAL OBJECTS SCENE ++++++++++++++++++++++++++++++++++++++++++++++++

float localSceneSDF(vec4 p){
    float sceneDist;
    float lightDist;
    float distance = MAX_DIST;

    lightDist=sphereSDF(p, localLightPos, lightRad);
    distance=min(distance, lightDist);
    
    if (lightDist < EPSILON){
        //LIGHT=true;
        hitWhich = 1;
        colorOfLight=vec3(1., 1., 1.);
        return lightDist;
    }

    
    sceneDist=locSceneChoice(p);
    distance = min(distance, sceneDist);
    
        if (sceneDist<EPSILON){
            hitWhich=3;
            return sceneDist;
        }


    return distance;
}












//GLOBAL OBJECTS SCENE ++++++++++++++++++++++++++++++++++++++++++++++++
// Global signed distance function : distance from cellBoost * p to an object in the global scene
float globalSceneSDF(vec4 p){
    // correct for the fact that we have been moving
    vec4 absolutep = translate(cellBoost, p);
    float distance = MAX_DIST;
    //Light Objects
    for (int i=0; i<4; i++){
        float objDist;
        objDist = sphereSDF(
        absolutep,
        lightPositions[i],
        0.1
        //    1.0/(10.0*lightIntensities[i].w)
        );
        distance = min(distance, objDist);
        if (distance < EPSILON){
            hitWhich = 1;
            globalLightColor = lightIntensities[i];
            return distance;
        }
    }
    //Global Sphere Object
    return distance;
    // return MAX_DIST;
}





















// check if the given point p is in the fundamental domain of the lattice.

bool isOutsideCell(vec4 p, out Isometry fixMatrix){
    //vec4 ModelP= modelProject(p);
    
    //lattice basis divided by the norm square
 //right now norm square is 1 so haven't put that in yet.
    vec4 v1 = V1;
    vec4 v2 = V2;
    vec4 v3 = V3;

    //right now this turns off the vertical translation generators for rendering the "plane" scene.  Need a better way of doing this in general, to be able to turn off some at will.
    if (display!=2){
        if (dot(p, v3) > 0.5) {
            fixMatrix = Isometry(invGenerators[4]);
            return true;
        }
        if (dot(p, v3) < -0.5) {
            fixMatrix = Isometry(invGenerators[5]);
            return true;
        }
    }

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


