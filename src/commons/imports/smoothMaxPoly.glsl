/**
 *  Smooth max, polynomial version
 */
float smoothMaxPoly(float a, float b, float k){
    float h = max(1. - abs(a - b) / k, 0.);
    return max(a, b) + 0.25 * k * h * h;
}

/**
 * Auxiliary method to compute the gradient of the SDF obtained with a smooth max
 * @param[in] dist1 - the result of the first sdf
 * @param[in] dist2 - tthe result of the second sdf
 * @param[in] grad1 - the gradient of the first sdf
 * @param[in] grad2 - the gradient of the second sdf
 */
RelVector gradientMaxPoly(float dist1, float dist2, RelVector grad1, RelVector grad2, float k){
    RelVector gradMin, gradMax;
    if (dist1 < dist2) {
        gradMin = grad1;
        gradMax = grad2;
    }
    else {
        gradMin = grad2;
        gradMax = grad1;
    }
    float h = max(1. - abs(dist1 - dist2) / k, 0.);
    return add(multiplyScalar(1. - 0.5 * h, gradMax), multiplyScalar(0.5 * h, gradMin));
}
