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
    ExtVector globalV0 = v;
    ExtVector globalV = globalV0;
    ExtVector localV0 = v;
    ExtVector localV = localV0;
    ExtVector res = v;
    int auxId;
    int auxHit;
    float marchingStep = camera.minDist;
    float dist;
    int hit = 0;


    // local scene
    for (int i = 0; i < camera.maxSteps; i++){
        // start by teleporting eventually the vector
        localV = teleport(localV);
        if (localV.isTeleported){
            // if a teleport was needed, update the starting point of the local raymarching
            localV0 = localV;
            /** @warning if minDist is not zero... this line may produce some jumps */
            marchingStep = camera.minDist;
        }
        else {
            // if no teleport was needed, then march
            if (localV.travelledDist > camera.maxDist) {
                break;
            }
            dist = localSceneSDF(localV.vector, auxHit, auxId);
            if (auxHit == HIT_DEBUG){
                hit = HIT_DEBUG;
                break;
            }
            if (auxHit == HIT_SOLID) {
                // we hit an object
                hit = auxHit;
                objId = auxId;
                v = localV;
                break;
            }
            marchingStep = marchingStep + dist;
            localV = creepingFlow(localV0, marchingStep, camera.threshold);
        }
    }

    //global scene
    marchingStep = camera.minDist;
    for (int i=0; i < camera.maxSteps; i++){

        if (globalV.travelledDist > localV.travelledDist || globalV.travelledDist > camera.maxDist){
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
        marchingStep = marchingStep + dist;
        globalV = flow(globalV0, marchingStep);
    }

    return hit;
}

vec3 getColor(ExtVector v){
    vec3 color = vec3(0);
    vec3 reflect = vec3(1);// the ratio of light involved during the iteration
    ColorData data;
    vec3 coeff;
    int objId;
    int hit;
    bool stop;

    for (int k=0; k <= scene.maxBounces; k++){
        hit = raymarch(v, objId);
        if (hit == HIT_DEBUG) {
            return debugColor;
        }
        if (hit == HIT_NOTHING) {
            return color + reflect * scene.background;
        }
        if (hit == HIT_SOLID) {
            data = getSolidColorData(v, objId);
            stop = k == scene.maxBounces || !data.isReflecting || length(data.reflectivity) == 0.;
            if (stop){
                return color + reflect * data.color;
            }
            coeff = reflect * (vec3(1) - data.reflectivity);
            color = color + coeff * data.color;
            reflect = reflect * data.reflectivity;
        }
    }
    // we should never reach this point.
    return color;
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
    
    RelVector vector = mapping(spherePosition);
    ExtVector v = ExtVector(vector, 0., 0., false);
    vec3 color = getColor(v);
    //vec3 color = abs(normalize(vector.local.dir.xyw));
    gl_FragColor = vec4(color, 1);


}
`;