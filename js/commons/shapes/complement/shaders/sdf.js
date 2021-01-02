// language=Mustache + GLSL
export default `//
/**
 * SDF for the complement of a shape
 */
float {{name}}_sdf(ExtVector v){
    return - {{shape.name}}_sdf(v);
}`;