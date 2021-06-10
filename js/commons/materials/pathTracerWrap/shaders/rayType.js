// language=Mustache + GLSL
export default `//

RayType {{name}}_setRayType(ExtVector v, RelVector n) {
    return setRayType({{name}}, v, n);
}
`;