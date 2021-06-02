// language=Mustache + GLSL
export default `//
vec3 {{name}}_render(ExtVector v) {
    return render({{name}});
}
`;