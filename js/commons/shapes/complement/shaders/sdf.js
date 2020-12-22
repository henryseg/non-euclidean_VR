// language=Mustache + GLSL
export default `//
/**
 * SDF for the union of two shapes
 */
float {{name}}_sdf(RelVector v){
    return - {{shape.name}}_sdf(v);
}`;