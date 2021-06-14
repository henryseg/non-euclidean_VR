// language=Mustache + GLSL
export default `//
vec3 {{name}}_render(ExtVector v, RelVector normal, vec2 uv, RayType rayType) {
    if (rayType.reflect){
      return {{name}}.specular;
    }
    return {{material.name}}_render(v, uv);
}
`;