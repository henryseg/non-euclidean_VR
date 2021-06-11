// language=Mustache + GLSL
export default `//
/**
* SDF for the displacement of a shape
*/
float {{name}}_sdf(RelVector v){
    float x = v.local.pos.coords.x;
    float y = v.local.pos.coords.y;
    float z = v.local.pos.coords.z;
    float disp = sin(20. * x) * sin(20. * y) * sin(20. * z);
    return {{shape.name}}_sdf(v) + disp;
}
`;