// language=Mustache + GLSL
export default `//
vec3 {{name}}_render(RelVector v, RelVector normal) {
    bool check;
    RelVector dir;
    float intensity;

    vec3 color = vec3(0);

    {{#lights}}
        check = {{name}}_directions(v, 0, dir, intensity);
        if(check) {
            color = abs(v.local.dir.xyz);
            //color = vec3(intensity,0, 0);
        } else {
            color = debugColor;
        }
    {{/lights}}
    //return color;
    return 0.2*color;
}
`;