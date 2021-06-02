// language=Mustache + GLSL
export default `//
vec3 {{name}}_render(ExtVector v, RelVector normal) {
    bool check;
    RelVector dir;
    float intensity;

    vec3 color = vec3(0);

    {{#lights}}
        check = {{name}}_directions(v.vector, 0, dir, intensity);
        if(check) {
            color = abs(dir.local.dir.xyz);
            //color = 50.*vec3(intensity,0, 0);
        } else {
            color = debugColor;
        }
    {{/lights}}
    return debugColor;
//    return color;
   
}
`;