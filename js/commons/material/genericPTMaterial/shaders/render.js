// language=Mustache + GLSL
export default `//
vec3 {{name}}_render(RelVector v, vec2 uv) {
    return render({{name}}, v, uv);
}
`;