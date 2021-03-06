// language=Mustache + GLSL
export default `//
/**
 * SDF for the union of two shapes
 */
float {{name}}_sdf(RelVector v){
    float dist1 = {{shape1.name}}_sdf(v);
    float dist2 = {{shape2.name}}_sdf(v);
    return min(dist1, dist2);
}`;