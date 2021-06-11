// language=Mustache + GLSL
export default `//

RayType {{name}}_setRayType(ExtVector v, RelVector n,float r) {
    return setRayType({{name}}, v, n, r);
}

vec3 {{name}}_render(ExtVector v, RelVector normal, RayType rayType) {
    return render({{name}}, v, rayType);
}
`;