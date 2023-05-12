/**
 * Distance between two points
 */
float dist(Point p1, Point p2){
    return abs(acos(dot(p1.coords, p2.coords)));
}