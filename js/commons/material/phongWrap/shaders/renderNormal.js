// language=Mustache + GLSL
export default `//
vec3 {{name}}_render(RelVector v, RelVector normal) {
    RelVector[1] dirs;
    float[1] intensities;
    int k;

    PhongWrapMaterial material = {{name}};
    vec3 baseColor = {{material.name}}_render(v, normal);
    vec3 color = vec3(0);

    {{#lights}}
        k = {{name}}_directions(v, dirs, intensities);
        for(int j=0; j < k; j++){
        color = color + lightComputation(v.local, normal.local, dirs[j].local, baseColor, material, {{name}}.color, intensities[j]);
        }
    {{/lights}}
    
    return color;
}
`;