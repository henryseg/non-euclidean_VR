// language=GLSL
export default `//
/***********************************************************************************************************************
 ***********************************************************************************************************************
 *
 * Data carried with RelVector
 *
 ***********************************************************************************************************************
 **********************************************************************************************************************/

struct VectorData {
    float lastFlowTime;
    float travelledDist;
    float totalTravelDist;
    bool isTeleported;
    vec3 accColor; /**< accumulated color : color computed until the current stage */
    vec3 leftToComputeColor; /**< amount of color that is left to compute for each RGB channel */
    bool stop; /** do we stop bouncing ? */

};

VectorData initVectorData(){
    return VectorData(0., 0., 0., false, vec3(0), vec3(1), false);
}

`;