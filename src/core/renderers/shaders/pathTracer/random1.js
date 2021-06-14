/**
 * Common random computation for the path tracer
 *
 */
// language=GLSL
export default `//

uint seed;

/**
 * Generate a (pseudo-)random seed for the pixel
 * The function is called at the very beginning of the main method
 * param[in] coords the coordinates of the pixel
 * param[in] frameSeed a seeed for the frame (computed by javascript and passed to the shader as uniform)
 */
void initSeed(vec2 coords, uint frameSeed){
    uvec2 aux = uvec2(coords);
    seed =  aux.x * uint(1973) + aux.y * uint(925277) + frameSeed * uint(26699) | uint(1);
}

/**
 * Random Number Generators
 * Copied from 
 * https://blog.demofox.org/2020/05/25/casual-shadertoy-path-tracing-1-basic-camera-diffuse-emissive/
 */
uint wangHash() {
    seed = (seed ^ uint(61)) ^ (seed >> uint(16));
    seed = seed * uint(9);
    seed = seed ^ (seed >> 4);
    seed = seed * uint(0x27d4eb2d);
    seed = seed ^ (seed >> 15);
    return seed;
}

/**
 * Return a (pseudo-)random number between 0 and 1
 */
float randomFloat() {
    return float(wangHash()) / 4294967296.;
}

/**
 * Compute a random unit vector in R^3 (with respect to th canonical basis)
 * Uses Archimedes "On the Sphere and Cylinder" (see also Lambert cylindrical equal-area projection)
 * Uniform distribution on a sphere is the horizontal projection of uniform distribution on a cylinder,
 * which unrolls to uniform on a rectangle
 */
vec3 randomUnitVec3() {
    float z = randomFloat() * 2. - 1.;
    float theta = randomFloat() * 2. * PI;
    float r = sqrt(1. - z * z);
    float x = r * cos(theta);
    float y = r * sin(theta);
    return vec3(x, y, z);
}

/**
 * Return a random unique vector at the given point
 * @param[in] p the underlying position of the vector 
 */
Vector randomVector(Point p) {
    vec3 dir = randomUnitVec3();
    return createVectorOrtho(p, dir);
}

/**
 * this is an idea for sampling a normal distribution from wikipedia,
 * by getting two independent normally distributed values out of two uniform distributed values
 */
vec2 randomNormal2D(){
    float u = randomFloat();
    float v = randomFloat();

    float r = sqrt(abs(2. * log(u)));
    float x = r * cos(2. * PI * v);
    float y = r * sin(2. * PI * v);

    return vec2(x, y);

}

/**
 * get a single one by just projecting off one of them
 */
float randomNormal(float mean, float stdev){

    //get 1d normal sample:
    float x = randomNormal2D().x;

    //adjust for mean and variance:
    return stdev * x + mean;
}



`;
