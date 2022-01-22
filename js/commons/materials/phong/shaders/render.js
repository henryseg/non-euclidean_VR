// language=Mustache + GLSL
export default `//
vec3 {{name}}_render(ExtVector v, RelVector normal) {
    bool check;
    RelVector dir;
    float intensity;
    int k;
 
    PhongMaterial material = {{name}};
    vec3 color = vec3(0);

    {{#lights}}
        k = {{name}}.maxDirs;
        for(int j=0; j < k; j++){
            check = {{name}}_directions(v.vector, j, dir, intensity);
            if(check) {
                color = color + lightComputation(v.vector.local, normal.local, dir.local, material, {{name}}.color, intensity);
            }
        }
    {{/lights}}
    
    return color;
}
`;