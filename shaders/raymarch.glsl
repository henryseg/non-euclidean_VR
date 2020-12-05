/***********************************************************************************************************************
 * @file
 * Raymarching (merge this file with other small files ?)
 **********************************************************************************************************************/



/**
 * Ray-marching.
 * @param[inout] v The initial vector for raymarching.
 * The vector is updated by the function,
 * that is at the end, `v` is the incidence vector at which we hit an object (if any)
 * @param[out] fixIsom isometry collecting all the teleportations done during the ray-marching
 * @param[out] obj the object that we enventually hit
 * @return
 * - 1 if an object has been hit
 * - 0 if no object has bee hit
 * - -1, if there is a bug
 * @remark Raymarch, starting each new step from the origin (goal : reduce accumulative errors)
 */
int raymarch(inout RelVector v, out Solid solid){
    RelVector globalV0 = v;
    RelVector globalV = v;
    RelVector localV0 = v;
    RelVector localV = v;
    RelVector res = v;
    Solid auxSolid;
    float marchingStep = minDist;
    float globalDepth = minDist;
    float localDepth = minDist;
    float dist;
    bool hasTeleported;
    int auxHit;
    int hit = 0;


    // local scene
    for (int i = 0; i < maxMarchingSteps; i++){
        localV = teleport(localV, hasTeleported);
        if (hasTeleported){
            localV0 = localV;
            marchingStep = minDist;
        }
        else {
            if (localDepth > maxDist) {
                break;
            }
            dist = localSceneSDF(localV, auxHit, auxSolid);
            if (auxHit == 1) {
                // we hit an object
                hit = auxHit;
                solid = auxSolid;
                res = localV;
                //return -1;
                break;
            }
            marchingStep = marchingStep + dist;
            localDepth  = localDepth + dist;
            localV = flow(localV0, marchingStep);
        }
    }


    //global scene
    for (int i=0; i < maxMarchingSteps; i++){
        if (globalDepth > localDepth || globalDepth > maxDist){
            // we reached the maximal distance
            break;
        }
        dist = globalSceneSDF(globalV, auxHit, auxSolid);
        if (auxHit == 1) {
            // we hit an object
            hit = auxHit;
            solid = auxSolid;
            res = globalV;
            break;
        }
        globalDepth = globalDepth + dist;
        globalV = flow(globalV0, globalDepth);
    }

    v = res;
    return hit;
}
