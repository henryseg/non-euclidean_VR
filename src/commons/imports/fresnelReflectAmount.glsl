/**
 * @param[in] r ration of indices of refraction current/entering
 */
float fresnelReflectAmount(RelVector incident, RelVector normal, float r, float reflecAt0, float relfectAt90) {
    // Schlick aproximation
    float r0 = (r - 1.) / (r + 1.);
    r0 = r0 * r0;
    float cosX = -geomDot(normal, incident);
    if (r > 1.)
    {
        float sinT2 = r * r * (1. - cosX * cosX);
        // Total internal reflection
        if (sinT2 > 1.){
            return relfectAt90;
        }
        cosX = sqrt(1. - sinT2);
    }
    float x = 1.- cosX;
    float ret = clamp(r0 + (1. - r0) * x * x * x * x * x, 0., 1.);

    // adjust reflect multiplier for object reflectivity
    //return mix(f0, f90, ret);
    return reflecAt0 + (relfectAt90 - reflecAt0) * ret;
}