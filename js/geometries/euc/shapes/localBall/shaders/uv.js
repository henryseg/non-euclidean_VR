// language=Mustache + GLSL
export default `//
vec2 {{name}}_uvMap(ExtVector v){
    return uvMap({{name}}, v);
}
`;