// language=GLSL
export default `//
/**
 * Distance between two points
 */
float dist(Point p1, Point p2){
    return acos(dot(p1.coords, p2.coords));
}
`;