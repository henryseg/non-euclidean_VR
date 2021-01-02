// language=Mustache + GLSL
export default `//
ExtVector {{name}}_gradient(ExtVector v){
    float newEp = 0.001;
    
    ExtVector shiftPX = smallShift(v, vec3(newEp, 0, 0));
    ExtVector shiftPY = smallShift(v, vec3(0, newEp, 0));
    ExtVector shiftPZ = smallShift(v, vec3(0, 0, newEp));
    ExtVector shiftMX = smallShift(v, vec3(-newEp, 0, 0));
    ExtVector shiftMY = smallShift(v, vec3(0, -newEp, 0));
    ExtVector shiftMZ = smallShift(v, vec3(0, 0, -newEp));
    
    float vgx = {{name}}_sdf(shiftPX) - {{name}}_sdf(shiftMX);
    float vgy = {{name}}_sdf(shiftPY) - {{name}}_sdf(shiftMY);
    float vgz = {{name}}_sdf(shiftPZ) - {{name}}_sdf(shiftMZ);
    ExtVector n = createVector(v, vec3(vgx, vgy, vgz));
    
    n = geomNormalize(n);
    return n;
}
`;