// language=Mustache + GLSL
export default `//
/**
 * Gradient for the union of two shapes
 */
RelVector {{name}}_gradient(RelVector v){
    float dist1 = {{shape1.name}}_sdf(v);
    float dist2 = {{shape2.name}}_sdf(v);
    RelVector grad1 = {{shape1.name}}_gradient(v);
    RelVector grad2 = {{shape2.name}}_gradient(v);
    RelVector gradMin, gradMax;
    if(dist1 < dist2) {
        gradMin = grad1;
        gradMax = grad2;
    }
    else{
        gradMin = grad2;
        gradMax = grad1;
    }   
    float h = max(1. - abs(dist1 - dist2) / {{name}}.maxCoeff, 0.);
    return add(multiplyScalar(1. - 0.5 * h, gradMax), multiplyScalar(0.5 * h, gradMin)); 
}`;