// language=GLSL
export default `//
/**
 * Distance between two points
 */
float dist(Point p1, Point p2){
    return length(p1.coords - p2.coords);
}
`;