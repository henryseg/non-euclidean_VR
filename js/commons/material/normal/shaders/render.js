// language=Mustache + GLSL
export default `//
vec3 {{name}}_render(ExtVector v, ExtVector normal) {
    return normalMaterialRender(v,normal);
}
`;