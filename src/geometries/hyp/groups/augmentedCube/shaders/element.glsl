/***********************************************************************************************************************
 * @struct
 * Quotient of a genus two surface
 **********************************************************************************************************************/

struct GroupElement {
    Isometry isom;
    int finitePart;
};

const GroupElement GROUP_IDENTITY = GroupElement(IDENTITY, 0);

GroupElement multiply(GroupElement elt1, GroupElement elt2) {
    Isometry isom = multiply(elt1.isom, elt2.isom);
    int finitePart = int(mod(float(elt1.finitePart + elt2.finitePart), 6.));
    return GroupElement(isom, finitePart);
}

Isometry toIsometry(GroupElement elt) {
    return elt.isom;
}