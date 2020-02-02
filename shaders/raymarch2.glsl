

//----------------------------------------------------------------------------------------------------------------------
//Geometry of the Models
//----------------------------------------------------------------------------------------------------------------------


//project point back onto the geometry
vec4 geomProject(vec4 p){
    return p;
}


//Project onto the Klein Model
vec4 modelProject(vec4 p){
    return p;

}


 
//----------------------------------------------------------------------------------------------------------------------
// Raymarch Primitives
//----------------------------------------------------------------------------------------------------------------------


float sphereSDF(vec4 p, vec4 center, float radius){
    return exactDist(p, center) - radius;
}


float ellipsoidSDF(vec4 p, vec4 center, float radius){
    return exactDist(vec4(p.x, p.y, p.z/2., 1.), center) - radius;
}

float fatEllipsoidSDF(vec4 p, vec4 center, float radius){
    return exactDist(vec4(p.x/10., p.y/10., p.z, 1.), center) - radius;
}

float centerSDF(vec4 p, vec4 center, float radius){
    return sphereSDF(p, center, radius);
}


float vertexSDF(vec4 p, vec4 cornerPoint, float size){
    return sphereSDF(abs(p), cornerPoint, size);
}

float horizontalHalfSpaceSDF(vec4 p, float h) {
    //signed distance function to the half space z < h
    return p.z - h;
}


float sliceSDF(vec4 p) {
    float HS1= 0.;
    HS1=horizontalHalfSpaceSDF(p, -0.1);
    float HS2=0.;
    HS2=-horizontalHalfSpaceSDF(p, -1.);
    return max(HS1, HS2);
}

float cylSDF(vec4 p, float r){
    return sphereSDF(vec4(p.x, p.y, 0., 1.), ORIGIN, r);
}

//----------------------------------------------------------------------------------------------------------------------
// Global Variables
//----------------------------------------------------------------------------------------------------------------------
tangVector N;//normal vector
tangVector sampletv;
vec4 globalLightColor;
Isometry identityIsometry=Isometry(mat4(1.0));

Isometry currentBoost;
Isometry leftBoost;
Isometry rightBoost;
Isometry cellBoost;
Isometry invCellBoost;
Isometry globalObjectBoost;


//----------------------------------------------------------------------------------------------------------------------
// Re-packaging isometries, facings in the shader
//----------------------------------------------------------------------------------------------------------------------

//This actually occurs at the beginning of main() as it needs to be inside of a function


//----------------------------------------------------------------------------------------------------------------------
// Scene Definitions
//----------------------------------------------------------------------------------------------------------------------
// Turn off the local scene
// Local signed distance function : distance from p to an object in the local scene

float localSceneSDF(vec4 p){
    float tilingDist;
    float dragonDist;
    float planesDist;
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

    if (display==3){ //dragon
        vec4 center = vec4(0., 0., 0., 1.);;
        float dragonDist = fatEllipsoidSDF(p, center, 0.03);
        distance = min(distance, dragonDist);
        if (dragonDist<EPSILON){
            //LIGHT=false;
            hitWhich=3;
            return dragonDist;
        }

    }

    if (display==4){ //dragon tiling
        vec4 center = vec4(0., 0., 0., 1.);
        float dragonDist = ellipsoidSDF(p, center, 0.2);
        //float dragonDist = fatEllipsoidSDF(p, center, 0.03);
        distance = min(distance, dragonDist);
        if (dragonDist<EPSILON){
            //LIGHT=false;
            hitWhich=3;
            return dragonDist;
        }

    }

    if (display==1){ //tiling
        vec4 center = vec4(0., 0., 0., 1.);
        float sphere=0.;
        sphere = ellipsoidSDF(p, center, 0.35);
        tilingDist=-sphere;


        //cut out a vertical cylinder to poke holes in the top, bottom
        //    float cyl=0.0;
        //    cyl=cylSDF(p,0.2);
        //    tilingDist= -min(sphere, cyl);
        //

        //instead, cut out two balls from the top, bottom
        //right now not working well because of the sphere distance function
        //    float topSph=0.0;
        //    float bottomSph=0.0;
        //    float spheres=0.;
        //    topSph=sphereSDF(p, vec4(0.,0.,z0,1.),0.7);
        //    bottomSph=sphereSDF(p, vec4(0.,0.,-z0,1.),0.7);
        //    spheres=min(topSph,bottomSph);
        //    tilingDist=-min(sphere,spheres);

        distance=min(distance, tilingDist);

        if (tilingDist < EPSILON){
            // LIGHT=false;
            hitWhich=3;
            return tilingDist;
        }
    }

    if (display==2){ //planes
        vec4 center = vec4(0., 0., 0., 1.);
        float sphere=0.;
        sphere = sphereSDF(p, center, 0.5);

        planesDist = -sphere;
        distance=min(distance, planesDist);
        if (planesDist < EPSILON){

            hitWhich=3;
            return planesDist;
        }
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

    float objDist = sliceSDF(absolutep);
    //float slabDist;
    //float sphDist;
    //slabDist = sliceSDF(absolutep);
    //sphDist=sphereSDF(absolutep,vec4(0.,0.,-0.2,1.),0.5);
    //objDist=max(slabDist,-sphDist);
    // objDist=MAX_DIST;


    //global plane


    //    vec4 globalObjPos=translate(globalObjectBoost, ORIGIN);
    //    //objDist = sphereSDF(absolutep, vec4(sqrt(6.26), sqrt(6.28), 0., 1.), globalSphereRad);
    //    objDist = sphereSDF(absolutep, globalObjPos, 0.1);
    //
    //
    //
    //    distance = min(distance, objDist);
    //    if (distance < EPSILON){
    //        hitWhich = 2;
    //    }


    return distance;
    // return MAX_DIST;
}


// check if the given point p is in the fundamental domain of the lattice.

float denominator=GoldenRatio+2.;

bool isOutsideCell(vec4 p, out Isometry fixMatrix){
    //vec4 ModelP= modelProject(p);


    //lattice basis divided by the norm square
    vec4 v1 = vec4(GoldenRatio, -1., 0., 0.);
    vec4 v2 = vec4(1., GoldenRatio, 0., 0.);
    vec4 v3 = vec4(0., 0., 1./z0, 0.);

    if (display!=3){
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


//----------------------------------------------------------------------------------------------------------------------
// GEOM DEPENDENT
//----------------------------------------------------------------------------------------------------------------------

//----------------------------------------------------------------------------------------------------------------------
// DOING THE RAYMARCH
//----------------------------------------------------------------------------------------------------------------------


// variation on the raymarch algorithm
// now each step is the march is made from the previously achieved position (useful later for Sol).

//void raymarch(tangVector rayDir, out Isometry totalFixMatrix){
//    Isometry fixMatrix;
//    float marchStep = MIN_DIST;
//    float globalDepth = MIN_DIST;
//    float localDepth = MIN_DIST;
//    tangVector tv = rayDir;
//    tangVector localtv = rayDir;
//    totalFixMatrix = identityIsometry;
//
//
//    // Trace the local scene, then the global scene:
//
//    if (TILING_SCENE){
//        for (int i = 0; i < MAX_MARCHING_STEPS; i++){
//            localtv = flow(localtv, marchStep);
//
//            if (isOutsideCell(localtv, fixMatrix)){
//                totalFixMatrix = composeIsometry(fixMatrix, totalFixMatrix);
//                localtv = translate(fixMatrix, localtv);
//                marchStep = MIN_DIST;
//            }
//            else {
//                float localDist = min(5., localSceneSDF(localtv.pos));
//                if (localDist < EPSILON){
//                    // hitWhich = 3;
//                    sampletv = localtv;
//                    break;
//                }
//                marchStep = localDist;
//                globalDepth += localDist;
//            }
//        }
//        localDepth = min(globalDepth, MAX_DIST);
//    }
//    else {
//        localDepth=MAX_DIST;
//    }
//
//
//    if (GLOBAL_SCENE){
//        globalDepth = MIN_DIST;
//        marchStep = MIN_DIST;
//
//        for (int i = 0; i < MAX_MARCHING_STEPS; i++){
//            tv = flow(tv, marchStep);
//
//            /*
//            if (i == 15) {
//                hitWhich = 5;
//                debugColor = 10000. * vec3(0, 0, marchStep);
//                break;
//            }
//            */
//
//            float globalDist = globalSceneSDF(tv.pos);
//            if (globalDist < EPSILON){
//                // hitWhich has now been set
//                totalFixMatrix = identityIsometry;
//                sampletv = tv;
//                //hitWhich = 5;
//                //debugColor = 0.1*vec3(globalDepth, 0, 0);
//                return;
//            }
//            marchStep = globalDist;
//            globalDepth += globalDist;
//            if (globalDepth >= localDepth){
//                //hitWhich = 5;
//                //debugColor = vec3(0, globalDepth, 0);
//                break;
//            }
//        }
//        /*
//        if(hitWhich == 0) {
//            hitWhich = 5;
//            debugColor = 0.1*vec3(0, 0, globalDepth);
//        }
//        */
//    }
//}


// variation on the raymarch algorithm
// now each step is the march is made from the previously achieved position (useful later for Sol).
// done with local vectors

int BINARY_SEARCH_STEPS=6;

void raymarch(localTangVector rayDir, out Isometry totalFixMatrix){

    Isometry fixMatrix;
    Isometry testFixMatrix;
    float marchStep = MIN_DIST;
    float testMarchStep = MIN_DIST;
    float globalDepth = MIN_DIST;
    float localDepth = MIN_DIST;
    localTangVector tv = rayDir;
    localTangVector localtv = rayDir;
    localTangVector testlocaltv = rayDir;
    localTangVector bestlocaltv = rayDir;
    totalFixMatrix = identityIsometry;
    // Trace the local scene, then the global scene:

    if (TILING_SCENE){
        
        
        
        for (int i = 0; i < MAX_MARCHING_STEPS; i++){
            float localDist = localSceneSDF(localtv.pos);
            
            
            if (localDist < EPSILON){
                  sampletv = toTangVector(localtv);
                  break;
              }
              marchStep = localDist;
            
            //localtv = flow(localtv, marchStep);

//            if (isOutsideCell(localtv, fixMatrix)){
//                totalFixMatrix = composeIsometry(fixMatrix, totalFixMatrix);
//                localtv = translate(fixMatrix, localtv);
//                localtv=tangNormalize(localtv);
//                marchStep = MIN_DIST;
//            }
            
        testlocaltv = flow(localtv, marchStep);
        if (isOutsideCell(testlocaltv, fixMatrix)){
            bestlocaltv = testlocaltv;
            
            for (int j = 0; j < BINARY_SEARCH_STEPS; j++){
              ////// do binary search to get close to but outside this cell - 
              ////// dont jump too far forwards, since localSDF can't see stuff in the next cube
              testMarchStep = marchStep - pow(0.5,float(j+1))*localDist;
              testlocaltv = flow(localtv, testMarchStep);
              if ( isOutsideCell(testlocaltv, testFixMatrix) ){
                marchStep = testMarchStep;
                bestlocaltv = testlocaltv;
                fixMatrix = testFixMatrix;
              }
            }
            
            localtv = bestlocaltv;
            totalFixMatrix = composeIsometry(fixMatrix, totalFixMatrix);
            localtv = translate(fixMatrix, localtv);
            localtv=tangNormalize(localtv);
            //globalDepth += marchStep; 
            marchStep = MIN_DIST;
      }
            
                  else{ 
          localtv = testlocaltv; 
          globalDepth += marchStep; 
        }
      }
      localDepth=min(globalDepth, MAX_DIST);
    }
    else{localDepth=MAX_DIST;}


            
//            else {
//                float localDist = min(.5, localSceneSDF(localtv.pos));
//                if (localDist < EPSILON){
//                    //hitWhich = 3;
//                    sampletv = toTangVector(localtv);
//                    break;
//                }
//                marchStep = localDist;
//                globalDepth += localDist;
//            }
//        }
//        localDepth = min(globalDepth, MAX_DIST);
//    }
//    else {
//        localDepth=MAX_DIST;
//    }


    if (GLOBAL_SCENE){
        globalDepth = MIN_DIST;
        marchStep = MIN_DIST;

        for (int i = 0; i < MAX_MARCHING_STEPS; i++){
            tv = flow(tv, marchStep);

            /*
            if (i == 15) {
                hitWhich = 5;
                debugColor = 10000. * vec3(0, 0, marchStep);
                break;
            }
            */

            float globalDist = globalSceneSDF(tv.pos);
            if (globalDist < EPSILON){
                // hitWhich has now been set
                totalFixMatrix = identityIsometry;
                sampletv = toTangVector(tv);
                //hitWhich = 5;
                //debugColor = 0.1*vec3(globalDepth, 0, 0);
                return;
            }
            marchStep = globalDist;
            globalDepth += globalDist;
            if (globalDepth >= localDepth){
                //hitWhich = 5;
                //debugColor = vec3(0, globalDepth, 0);
                break;
            }
        }
        /*
        if(hitWhich == 0) {
            hitWhich = 5;
            debugColor = 0.1*vec3(0, 0, globalDepth);
        }
        */
    }
}


//void raymarch(tangVector rayDir, out mat4 totalFixMatrix){
//    mat4 fixMatrix;
//    float globalDepth = MIN_DIST;
//    float localDepth = MIN_DIST;
//    tangVector tv = rayDir;
//    tangVector localtv = rayDir;
//    totalFixMatrix = mat4(1.0);
//
//
//    // Trace the local scene, then the global scene:
//    for (int i = 0; i < MAX_MARCHING_STEPS; i++){
//        tangVector localEndtv = flow(localtv, localDepth);
//
//        if (isOutsideCell(localEndtv, fixMatrix)){
//            totalFixMatrix = fixMatrix * totalFixMatrix;
//            localtv = translate(fixMatrix, localEndtv);
//            localDepth = MIN_DIST;
//        }
//        else {
//            float localDist = min(0.1, localSceneSDF(localEndtv.pos));
//            if (localDist < EPSILON){
//                hitWhich = 3;
//                sampletv = localEndtv;
//                break;
//            }
//            localDepth += localDist;
//            globalDepth += localDist;
//        }
//    }
//
//
//    // Set for localDepth to our new max tracing distance:
//    localDepth = min(globalDepth, MAX_DIST);
//    globalDepth = MIN_DIST;
//    for (int i = 0; i < MAX_MARCHING_STEPS; i++){
//        tangVector globalEndtv = flow(tv, globalDepth);
//
//        float globalDist = globalSceneSDF(globalEndtv.pos);
//        if (globalDist < EPSILON){
//            // hitWhich has now been set
//            totalFixMatrix = mat4(1.0);
//            sampletv = globalEndtv;
//            return;
//        }
//        globalDepth += globalDist;
//        if (globalDepth >= localDepth){
//            break;
//        }
//    }
//}


