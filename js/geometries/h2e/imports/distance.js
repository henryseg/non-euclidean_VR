// language=GLSL
export default `//
/**
 * Distance between two points
 */
float dist(Point p1, Point p2){
    float aux1 = acosh(-hypDot(p1.coords.xyz, p2.coords.xyz));
    float aux2 = p1.coords.w - p2.coords.w;
    return sqrt(aux1 * aux1 + aux2 * aux2);
}
`;