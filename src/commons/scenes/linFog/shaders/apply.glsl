vec3 applyFog(vec3 color, float dist){
    float coeff = min(dist / fog.scattering, 1.);
    return (1. - coeff) * color + coeff * fog.color;
}

vec4 applyFog(vec4 color, float dist){
    float coeff = min(dist / fog.scattering, 1.);
    return (1. - coeff) * color + coeff * vec4(fog.color, 1);
}
