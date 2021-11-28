/***********************************************************************************************************************
 ***********************************************************************************************************************
 *
 * Subgroup managment
 *
 ***********************************************************************************************************************
 **********************************************************************************************************************/

const float PHI = 0.5 * (1. + sqrt(5.));
const float DENUM = 1. / (PHI + 2.);

/***********************************************************************************************************************
 * @struct
 * Integral Heisenberg group
 **********************************************************************************************************************/

struct GroupElement {
    vec2 coords; /**< integer coordinates of the element */
};

const GroupElement GROUP_IDENTITY = GroupElement(vec2(0));

GroupElement multiply(GroupElement elt1, GroupElement elt2){
    vec2 coords = elt1.coords + elt2.coords;
    return GroupElement(coords);
}

Isometry toIsometry(GroupElement elt) {
    float a = elt.coords.x;
    float b = elt.coords.y;
    vec4 coords = vec4((a * PHI + b) * DENUM, (-a + b * PHI) * DENUM, 0, 1);
    return makeTranslation(Point(coords));
}