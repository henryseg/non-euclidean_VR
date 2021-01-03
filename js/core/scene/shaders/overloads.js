// language=GLSL
export default `//
float localSceneSDF(ExtVector v, out int hit, out int objId){
    return localSceneSDF(v.vector, hit, objId);
}

float globalSceneSDF(ExtVector v, out int hit, out int objId){
    return globalSceneSDF(v.vector, hit, objId);
}

vec3 solidColor(ExtVector v, int objId) {
    return solidColor(v.vector, objId);
}
`;