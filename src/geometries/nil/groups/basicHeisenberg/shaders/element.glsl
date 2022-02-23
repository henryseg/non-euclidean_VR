/***********************************************************************************************************************
 ***********************************************************************************************************************
 *
 * Subgroup managment
 *
 ***********************************************************************************************************************
 **********************************************************************************************************************/

/***********************************************************************************************************************
 * @struct
 * Integral Heisenberg group
 **********************************************************************************************************************/

struct GroupElement {
    ivec3 icoords; /**< integer coordinates of the element */
};

const GroupElement GROUP_IDENTITY = GroupElement(ivec3(0));

GroupElement multiply(GroupElement elt1, GroupElement elt2){
    ivec3 c1 = elt1.icoords;
    ivec3 c2 = elt2.icoords;
    return GroupElement(ivec3(c1.x + c2.x, c1.y + c2.y, c1.z + c2.z + c1.x * c2.y));
}

Isometry toIsometry(GroupElement elt) {
    vec3 c = vec3(elt.icoords);
    Point point = Point(vec4(c.x, c.y, c.z -0.5 * c.x * c.y, 1));
    return makeTranslation(point);
}