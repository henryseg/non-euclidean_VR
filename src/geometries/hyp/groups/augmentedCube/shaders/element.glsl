/***********************************************************************************************************************
 * @struct
 * Quotient of a genus two surface
 **********************************************************************************************************************/

struct GroupElement {
    Isometry isom;
    ivec2 finitePart;
};

const GroupElement GROUP_IDENTITY = GroupElement(IDENTITY, ivec2(0, 1));

GroupElement multiply(GroupElement elt1, GroupElement elt2) {
    Isometry isom = multiply(elt1.isom, elt2.isom);
    ivec2 fp1 = elt1.finitePart;
    ivec2 fp2 = elt2.finitePart;
    ivec2 finitePart = ivec2(
        int(mod(float(fp1.x + fp1.y * fp2.x), 3.)),
        fp1.y * fp2.y
    );
    return GroupElement(isom, finitePart);
}

Isometry toIsometry(GroupElement elt) {
    return elt.isom;
}