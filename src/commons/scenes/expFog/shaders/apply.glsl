vec3 applyFog(vec3 color, float dist){
    float coeff = exp(- fog.scattering * dist);
    return coeff * color + (1. - coeff) * fog.color;
}

vec4 applyFog(vec4 color, float dist){
    float coeff = exp(- fog.scattering * dist);
    return coeff * color + (1. - coeff) * vec4(fog.color, 1);
}