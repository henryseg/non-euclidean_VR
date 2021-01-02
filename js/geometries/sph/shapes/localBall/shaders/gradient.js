// language=Mustache + GLSL
export default `//
ExtVector {{name}}_gradient(ExtVector v){
    return gradient({{name}},v);
}
`;
