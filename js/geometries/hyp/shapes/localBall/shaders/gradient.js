// language=Mustache + GLSL
export default `//
RelVector {{name}}_gradient(RelVector v){
    return gradient({{name}},v);
}
`;
