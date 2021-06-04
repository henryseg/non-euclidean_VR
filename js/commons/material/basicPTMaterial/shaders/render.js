// language=Mustache + GLSL
export default `//

RayType {{name}}_setRayType(ExtVector v, RelVector n) {
    return setRayType({{name}}, v, n);
}

vec3 {{name}}_render(ExtVector v, RayType rayType) {
    return render({{name}}, v, rayType);
}
`;