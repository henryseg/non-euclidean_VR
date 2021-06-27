vec3 applyFog(vec3 color, float dist){
    float coeff = min(dist / fog.scattering, 1.);
    return (1. - coeff) * color + coeff * fog.color;
}
