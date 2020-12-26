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
int raymarch(inout RelVector v, out int objId){
    RelVector globalV0 = v;
    RelVector globalV = globalV0;
    RelVector localV0 = v;
    RelVector localV = localV0;
    RelVector res = v;
    int auxId;
    int auxHit;
    float marchingStep = camera.minDist;
    float globalDepth = camera.minDist;
    float localDepth = camera.minDist;
    float dist;
    int hit = 0;


        // local scene
        for (int i = 0; i < camera.maxSteps; i++){
            // start by teleporting eventually the vector
            if (teleport(localV)){
                // if a teleport was needed, update the starting point of the local raymarching
                localV0 = localV;
                /** @warning if minDist is not zero... this line may produce some jumps */
                marchingStep = camera.minDist;
            }
            else {
                // if no teleport was needed, then march
                if (localDepth > camera.maxDist) {
                    break;
                }
                dist = localSceneSDF(localV, auxHit, auxId);
                if (auxHit == HIT_SOLID) {
                    // we hit an object
                    hit = auxHit;
                    objId = auxId;
                    res = localV;
                    break;
                }
                marchingStep = marchingStep + dist;
                localDepth  = localDepth + dist;
                localV = flow(localV0, marchingStep);
            }
        }

    //global scene
    for (int i=0; i < camera.maxSteps; i++){
        
        if (globalDepth > localDepth || globalDepth > camera.maxDist){
            // we reached the maximal distance
            break;
        }
        dist = globalSceneSDF(globalV, auxHit, auxId);
        if (auxHit == HIT_SOLID) {
            // we hit an object
            hit = auxHit;
            objId = auxId;
            res = globalV;
            break;
        }
        globalDepth = globalDepth + dist;
        globalV = flow(globalV0, globalDepth);
    }

    v = res;
    return hit;
}



/**
 * Position on the sphere.
 */
varying vec3 spherePosition;



/**
 * Main function. Wrap everything together:
 * - setup all the data
 * - Compute the direction where to start the ray-marching.
 * - Ray-march in this direction.
 * - If we hit an object compute the corresponding color.
 */
void main() {
    vec3 color;
    int objId;

    RelVector v = mapping(spherePosition);
    
    int hit = raymarch(v, objId);

    switch (hit) {
        case HIT_DEBUG:
        color = debugColor;
        break;
        case HIT_NOTHING:
        color = vec3(0.1, 0.1, 0.1);
        break;
        case HIT_SOLID :
        color = solidColor(v, objId);
        break;
        default :
        // there is a problem if we reached that point (hence the red color)!
        color = vec3(1, 0, 0);
    }

    gl_FragColor = vec4(color, 1);
}
`;