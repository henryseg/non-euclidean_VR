// language=Mustache + GLSL
export default `//
vec2 {{name}}_uvMap(RelVector v){
    return uvMap({{name}}, v);
}
`;