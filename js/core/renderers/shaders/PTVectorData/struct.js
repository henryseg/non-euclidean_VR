// language=GLSL
export default `//

/***********************************************************************************************************************
 ***********************************************************************************************************************
 *
 * Ray Type
 *
 ***********************************************************************************************************************
 **********************************************************************************************************************/

struct RayType{
    bool diffuse;
    bool reflect;
    bool refract;
    float chance;
};

/***********************************************************************************************************************
 ***********************************************************************************************************************
 *
 * Data carried with ExtVector
 *
 ***********************************************************************************************************************
 **********************************************************************************************************************/

struct VectorData {
    float lastFlowDist;/**< distance travelled the last time we called the 'flow' method */
    float lastBounceDist;/**< distance travelled since we last bounced on a solid */
    float totalDist;/**< distance travelled from the starting point */
    bool isTeleported;/**< true if we just teleported the vector */
    int iMarch; /**< number of time we looped in the raymarch method */
    int iBounce; /**< number of time we bounced on a solid */
    bool stop; /**< do we stop bouncing ? */
    vec3 pixel; /**<  */
    vec3 light; /**<  */
    vec3 absorb; /**< */
    
};

VectorData initVectorData(){
    return VectorData(0., 0., 0., false, 0, 0, false, vec3(0), vec3(1), vec(0));
}

`;