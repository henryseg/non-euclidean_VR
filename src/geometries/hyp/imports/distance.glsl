/**
 * Distance between two points
 */
float dist(Point p1, Point p2){
    return acosh(-hypDot(p1.coords, p2.coords));
}