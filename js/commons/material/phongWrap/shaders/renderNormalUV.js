// language=Mustache + GLSL
export default `//
vec3 {{name}}_render(ExtVector v, RelVector normal, vec2 uv) {
    bool check;
    RelVector dir;
    float intensity;
    int k;

    PhongWrapMaterial material = {{name}};
    vec3 baseColor = {{material.name}}_render(v, normal, uv);
    vec3 color = vec3(0);

    {{#lights}}
        k = {{name}}.maxDirs;
        for(int j=0; j < k; j++){
            check = {{name}}_directions(v.vector, j, dir, intensity);
            if(check) {
                color = color + lightComputation(v.vector.local, normal.local, dir.local, baseColor, material, {{name}}.color, intensity);
            }
        }
    {{/lights}}
}
`;