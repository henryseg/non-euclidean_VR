/**
 * @deprecated
 * Use applyGroupElement instead
 */
Point applyIsometry(GroupElement elt, Point p){
    return applyIsometry(toIsometry(elt), p);
}

Point applyGroupElement(GroupElement elt, Point p){
    return applyIsometry(toIsometry(elt), p);
}

/**
 * @deprecated
 * Use applyGroupElement instead
 */
Vector applyIsometry(GroupElement elt, Vector v){
    return applyIsometry(toIsometry(elt), v);
}

Vector applyGroupElement(GroupElement elt, Vector v){
    return applyIsometry(toIsometry(elt), v);
}


