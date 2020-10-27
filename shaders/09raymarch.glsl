





//----------------------------------------------------------------------------------------------------------------------
// DOING THE RAYMARCH
//----------------------------------------------------------------------------------------------------------------------


// raymarch algorithm
// each step is the march is made from the previously achieved position (useful later for Sol).
// done with general vectors


int BINARY_SEARCH_STEPS=10;

void raymarchIterate(Vector rayDir, out Isometry totalFixIsom){

    Isometry fixIsom;
    Isometry testfixIsom;
    float marchStep = MIN_DIST;
    float testMarchStep = MIN_DIST;
    float globalDepth = MIN_DIST;
    float localDepth = MIN_DIST;
    Vector tv = rayDir;
    Vector localtv = rayDir;
    Vector testlocaltv = rayDir;
    Vector bestlocaltv = rayDir;
    totalFixIsom = identity;

    // Trace the local scene, then the global scene:

    if (TILING_SCENE){
        for (int i = 0; i < MAX_MARCHING_STEPS; i++){
            localtv = flow(localtv, marchStep);
            if (isOutsideCell(localtv, fixIsom)){
                totalFixIsom = composeIsometry(fixIsom, totalFixIsom);
                localtv = translate(fixIsom, localtv);
                marchStep = MIN_DIST;
            }
            else {
                float localDist = min(1., localSceneSDF(localtv.pos));
                if (localDist < EPSILON){
                    sampletv = localtv;
                    break;
                }
                marchStep = localDist;
                globalDepth += localDist;
            }
        }

        localDepth=min(globalDepth, MAX_DIST);

        /*
        // TODO. VERSION TO BE CHECKED...
        for (int i = 0; i < MAX_MARCHING_STEPS; i++){
            float localDist = localSceneSDF(localtv.pos);


            if (localDist < EPSILON){
                sampletv = toTangVector(localtv);
                break;
            }
            marchStep = localDist;

            //localtv = flow(localtv, marchStep);

            //            if (isOutsideCell(localtv, fixIsom)){
            //                totalFixIsom = composeIsometry(fixIsom, totalFixIsom);
            //                localtv = translate(fixIsom, localtv);
            //                localtv=tangNormalize(localtv);
            //                marchStep = MIN_DIST;
            //            }

            testlocaltv = flow(localtv, marchStep);
            if (isOutsideCell(testlocaltv, fixIsom)){
                bestlocaltv = testlocaltv;

                for (int j = 0; j < BINARY_SEARCH_STEPS; j++){
                    ////// do binary search to get close to but outside this cell -
                    ////// dont jump too far forwards, since localSDF can't see stuff in the next cube
                    testMarchStep = marchStep - pow(0.5,float(j+1))*localDist;
                    testlocaltv = flow(localtv, testMarchStep);
                    if ( isOutsideCell(testlocaltv, testfixIsom) ){
                        marchStep = testMarchStep;
                        bestlocaltv = testlocaltv;
                        fixIsom = testfixIsom;
                    }
                }

                localtv = bestlocaltv;
                totalFixIsom = composeIsometry(fixIsom, totalFixIsom);
                localtv = translate(fixIsom, localtv);
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
        */

    }
    else {
        localDepth=MAX_DIST;
    }

    if (GLOBAL_SCENE){
        globalDepth = MIN_DIST;
        marchStep = MIN_DIST;

        for (int i = 0; i < MAX_MARCHING_STEPS; i++){
            tv = flow(tv, marchStep);

            /*
            if (i == 1) {
                float aux = globalSceneSDF(tv.pos);
                hitWhich = 5;
                //debugColor = 1000. * aux * vec3(1, 0, 0);
                debugColor = abs(tv.dir);
                break;
            }
            */

            float globalDist = globalSceneSDF(tv.pos);
            if (globalDist < EPSILON){
                // hitWhich has now been set
                totalFixIsom = identity;
                sampletv = tv;
                return;
            }
            marchStep = globalDist;
            globalDepth += globalDist;
            if (globalDepth >= localDepth){
                break;
            }
        }
    }
}


void raymarchDirect(Vector rayDir, out Isometry totalFixIsom){

    Isometry fixIsom;
    Isometry testFixIsom;
    float marchStep = MIN_DIST;
    float testMarchStep = MIN_DIST;
    float globalDepth = MIN_DIST;
    float localDepth = MIN_DIST;
    Vector tv = rayDir;
    Vector localtv = rayDir;
    Vector testlocaltv = rayDir;
    Vector bestlocaltv = rayDir;
    totalFixIsom = identity;

    // Trace the local scene, then the global scene:

    if (TILING_SCENE){
        /*
        // VERSION WITHOUT CREEPING
        for (int i = 0; i < MAX_MARCHING_STEPS; i++){
            localtv = flow(localtv, marchStep);
            if (isOutsideCell(localtv, fixIsom)){
                totalFixIsom = composeIsometry(fixIsom, totalFixIsom);
                localtv = translate(fixIsom, localtv);
                marchStep = MIN_DIST;
            }
            else {
                float localDist = min(1., localSceneSDF(localtv.pos));
                if (localDist < EPSILON){
                    sampletv = localtv;
                    break;
                }
                marchStep = localDist;
                globalDepth += localDist;
            }
        }

        localDepth=min(globalDepth, MAX_DIST);
        */

        // VERSION WITH CREEPING
        for (int i = 0; i < MAX_MARCHING_STEPS; i++){
            float localDist = localSceneSDF(localtv.pos);
            if (localDist < EPSILON){
                sampletv = localtv;
                distToViewer=localDepth;
                break;
            }
            marchStep = localDist;

            testlocaltv = flow(localtv, marchStep);
            if (isOutsideCell(testlocaltv, fixIsom)){
                bestlocaltv = testlocaltv;

                //commenting out this for loop brings us back to what we were doing before...
                for (int j = 0; j < BINARY_SEARCH_STEPS; j++){
                    // do binary search to get close to but outside this cell -
                    // dont jump too far forwards, since localSDF can't see stuff in the next cube
                    testMarchStep = marchStep - pow(0.5, float(j+1))*localDist;
                    testlocaltv = flow(localtv, testMarchStep);
                    if (isOutsideCell(testlocaltv, testFixIsom)){
                        marchStep = testMarchStep;
                        bestlocaltv = testlocaltv;
                        fixIsom = testFixIsom;
                    }
                }
                localtv = bestlocaltv;
                totalFixIsom = composeIsometry(fixIsom, totalFixIsom);
                localtv = translate(fixIsom, localtv);
                localDepth += marchStep;
                marchStep = MIN_DIST;
            }

            else {
                localtv = testlocaltv;
                localDepth += marchStep;
            }
        }

        localDepth=min(localDepth, MAX_DIST);


    }
    else {
        localDepth=MAX_DIST;
    }

    if (GLOBAL_SCENE){
        globalDepth = MIN_DIST;
        marchStep = MIN_DIST;

        for (int i = 0; i < MAX_MARCHING_STEPS; i++){
            tv = flow(rayDir, globalDepth);

            /*
            if (i == 2) {
                //float aux = globalSceneSDF(tv.pos);
                hitWhich = 5;
                //debugColor = 1000. * aux * vec3(1, 0, 0);
                debugColor = vec3(tv.pos.fiber, -tv.pos.fiber,0);
                break;
            }
            */


            float globalDist = globalSceneSDF(tv.pos);
            if (globalDist < EPSILON){
                // hitWhich has now been set
                //hitWhich = 5;
                //debugColor = abs(tv.dir);
                totalFixIsom = identity;
                sampletv = tv;
                distToViewer=globalDepth;
                return;
            }
            //marchStep = globalDist;
            globalDepth += globalDist;
            if (globalDepth >= localDepth){
                //hitWhich = 5;
                //debugColor = vec3(1, 1, 0);
                break;
            }
        }
    }
}


void raymarch(Vector rayDir, out Isometry totalFixIsom){
    //raymarchIterate(rayDir, totalFixIsom);
    raymarchDirect(rayDir, totalFixIsom);
}
















