// language=Mustache + GLSL
export default `//
/**
 * SDF for the complement of a shape
 */
float {{name}}_sdf(RelVector v){
    return - {{shape.name}}_sdf(v);
}`;