// language=Mustache + GLSL
export default `//
/**
* SDF for the displacement of a shape
*/
float {{name}}_sdf(RelVector v){
    
    float x = v.local.pos.coords.x;
    float y = v.local.pos.coords.y;
    float z = v.local.pos.coords.z;
    float disp = 0.05 * sin(30. * x) * sin(30. * y) * sin(30. * z);
    return {{shape.name}}_sdf(v) + disp;
}
`;