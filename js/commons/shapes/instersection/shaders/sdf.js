// language=Mustache + GLSL
export default `//
/**
 * SDF for the intersection of two shapes
 */
float {{name}}_sdf(RelVector v){
    float dist1 = {{shape1.name}}_sdf(v);
    float dist2 = {{shape2.name}}_sdf(v);
    return max(dist1, dist2);
}`;