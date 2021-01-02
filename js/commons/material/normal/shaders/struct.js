// language=GLSL
export default `//
/***********************************************************************************************************************
 * Normal Material
 * No need of a structure for this material.
 * However there is a function, to factorize the code
 **********************************************************************************************************************/

vec3 normalMaterialRender(ExtVector v, ExtVector normal) {
    Vector[3] f;
    frame(v.local.pos, f);
    float r =  geomDot(normal.local, f[0]);
    float g =  geomDot(normal.local, f[1]);
    float b =  geomDot(normal.local, f[2]);
    return abs(vec3(r, g, b));
}`;