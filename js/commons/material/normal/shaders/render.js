// language=Mustache + GLSL
export default `//
vec3 {{name}}_render(ExtVector v, RelVector normal) {
    return normalMaterialRender(v, normal);
}
`;