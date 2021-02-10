// language=Mustache + GLSL
export default `//
vec3 {{name}}_render(RelVector v, RelVector normal) {
    return normalMaterialRender(v,normal);
}
`;