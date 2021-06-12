// language=GLSL
export default `//
/***********************************************************************************************************************
 ***********************************************************************************************************************
 *
 * Raymarching
 *
 ***********************************************************************************************************************
 **********************************************************************************************************************/


/**
 * Ray-marching.
 * @param[inout] v The initial vector for raymarching.
 * The vector is updated by the function,
 * that is at the end, \`v\` is the incidence vector at which we hit an object (if any)
 * @param[out] solid the solid that we enventually hit
 * @param[out] normal the normal to the solid at the point we hit it
 * @return
 * - 1 if an object has been hit
 * - 0 if no object has bee hit
 * - -1, if there is a bug
 * @remark Raymarch, starting each new step from the origin (goal : reduce accumulative errors)
 * @todo Should we also teleport during the global raymarching?
 * - the telportations accumulate numerical errors, but the coordinates of the local vector, will remain bounded.
 * - if we go in this directiion, maybe we should merge the local and global raymarching.
 */
int raymarch(inout ExtVector v, out int objId){
    initFlow(v.vector.local);// initialize some data before marching. Mostly used for Sol only
    ExtVector globalV0 = v;
    ExtVector globalV = globalV0;
    ExtVector localV0 = v;
    ExtVector localV = localV0;
    ExtVector res = v;
    int auxId;
    int auxHit;
    float marchingStep = camera.minDist;
    float dist;
    int hit = HIT_NOTHING;

    
    // local scene
    for (int i = 0; i < camera.maxSteps; i++){
        // debugging stuff
        localV.data.iMarch = v.data.iMarch + i;
        
        // start by teleporting eventually the vector
        localV = teleport(localV);
        if (localV.data.isTeleported){
            // if a teleport was needed, update the starting point of the local raymarching
            localV0 = localV;
            /** @warning if minDist is not zero... this line may produce some jumps */
            marchingStep = camera.minDist;
        }
        else {
            // if no teleport was needed, then march
            if (localV.data.totalDist > camera.maxDist) {
                break;
            }
            dist = localSceneSDF(localV.vector, auxHit, auxId);
            if (auxHit == HIT_DEBUG){
                hit = HIT_DEBUG;
                break;
            }
            if (auxHit == HIT_SOLID) {
                // we hit an object
                hit = HIT_SOLID;
                objId = auxId;
                v = localV;
                break;
            }
            marchingStep = marchingStep + abs(dist);
            localV = creepingFlow(localV0, marchingStep, camera.threshold);
        }
    }
    if(hit == HIT_NOTHING) {
        v = localV;
    }
    //global scene
    marchingStep = camera.minDist;
    for (int i=0; i < camera.maxSteps; i++){
        // debugging stuff
        globalV.data.iMarch = v.data.iMarch + i;
        
        if (globalV.data.totalDist > localV.data.totalDist || globalV.data.totalDist > camera.maxDist){
            // we reached the maximal distance
            break;
        }
        dist = globalSceneSDF(globalV.vector, auxHit, auxId);

        if (auxHit == HIT_DEBUG){
            hit = HIT_DEBUG;
            break;
        }
        if (auxHit == HIT_SOLID) {
            // we hit an object
            hit = auxHit;
            objId = auxId;
            v = globalV;
            break;
        }
        marchingStep = marchingStep + abs(dist);
        globalV = flow(globalV0, marchingStep);
    }

    if(hit == HIT_NOTHING) {
        v = globalV;
    }
    return hit;
}

vec3 getColor(ExtVector v){
    int objId;
    int hit;
    for (int i = 0; i <= maxBounces; i++){
        if (v.data.stop){
            break;
        }
        hit = raymarch(v, objId);
        updateVectorData(v, hit, objId);
    }
    return v.data.pixel;
}
`;