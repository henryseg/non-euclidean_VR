// language=Mustache + GLSL
export default `//
vec3 {{name}}_render(ExtVector v, RelVector normal, RayType rayType) {
    if (rayType.reflect){
        return {{name}}.specular;
    }
    return {{material.name}}_render(v);
}
`;