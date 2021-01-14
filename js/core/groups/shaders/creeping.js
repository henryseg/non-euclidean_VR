// language=Mustache + GLSL
export default `//
/**
 * Default creeping function (binary search)
 * @param start starting point of the creeping
 * @param outside vector out of the boundary (obtained from the previous flow, or the previous creeping)
 * @param offset how long we flow after passing the boundary
 */
ExtVector {{glslCreepName}}(ExtVector v, ExtVector outside,  float offset){
    ExtVector try = outside;
    float sIn = 0.;
    float sOut = try.lastFlowTime;
    float s;
    for(int i=0; i < 100; i++){
        if(sOut - sIn < offset){
            break;
        }
        s = 0.5 * sIn + 0.5 * sOut;
        try = flow(v,s);
        if({{glslTestName}}(try.vector.local.pos)){
            sOut = s;
            outside = try;
        } else {
            sIn = s;
        }
    }
    return outside;
}

`;