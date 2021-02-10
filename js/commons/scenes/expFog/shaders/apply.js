// language=GLSL
export default `//
vec3 applyFog(vec3 color, float dist){
    float coeff = exp(- fog.scattering * dist);
    return coeff * color + (1. - coeff) * fog.color;
}
`