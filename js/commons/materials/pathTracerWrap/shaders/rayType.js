// language=Mustache + GLSL
export default `//

RayType {{name}}_setRayType(ExtVector v, RelVector n,float r) {
    return setRayType({{name}}, v, n,r);
}
`;