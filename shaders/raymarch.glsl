/***********************************************************************************************************************
 * @file
 * Raymarching (merge this file with other small files ?)
 **********************************************************************************************************************/



/**
 * Ray-marching.
 * @param[inout] v The initial vector for raymarching.
 * The vector is updated by the function,
 * that is at the end, `v` is the incidence vector at which we hit an object (if any)
 * @param[out] solid the solid that we enventually hit
 * @param[out] normal the normal to the solid at the point we hit it
 * @return
 * - 1 if an object has been hit
 * - 0 if no object has bee hit
 * - -1, if there is a bug
 * @remark Raymarch, starting each new step from the origin (goal : reduce accumulative errors)
 */
int raymarch(inout RelVector v, out Solid solid, out RelVector normal){
    RelVector globalV0 = v;
    RelVector globalV = v;
    RelVector localV0 = v;
    RelVector localV = v;
    RelVector res = v;
    Solid auxSolid;
    int auxHit;
    RelVector auxNormal;
    float marchingStep = minDist;
    float globalDepth = minDist;
    float localDepth = minDist;
    float dist;
    int hit = 0;


    // local scene
    for (int i = 0; i < maxMarchingSteps; i++){
        // start by teleporting eventually the vector
        if (teleport(localV)){
            // if a teleport was needed, update the starting point of the local raymarching
            localV0 = localV;
            marchingStep = minDist;
        }
        else {
            // if no teleport was needed, then march
            if (localDepth > maxDist) {
                break;
            }
            dist = localSceneSDF(localV, auxHit, auxSolid, auxNormal);
            if (auxHit == 1) {
                // we hit an object
                hit = auxHit;
                solid = auxSolid;
                normal = auxNormal;
                res = localV;
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
        dist = globalSceneSDF(globalV, auxHit, auxSolid, auxNormal);
        if (auxHit == 1) {
            // we hit an object
            hit = auxHit;
            solid = auxSolid;
            normal = auxNormal;
            res = globalV;
            break;
        }
        globalDepth = globalDepth + dist;
        globalV = flow(globalV0, globalDepth);
    }

    v = res;
    return hit;
}
