// language=Mustache + GLSL
export default `//
vec3 {{name}}_render(RelVector v) {
    return render({{name}});
}
`;