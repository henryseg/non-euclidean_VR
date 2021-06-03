// language=Mustache + GLSL
export default `//
vec3 {{name}}_render(ExtVector v) {
    return vec3(0, float(v.data.iMarch/camera.maxSteps), v.data.totalDist / camera.maxDist);
    //return debugColor;
}
`;