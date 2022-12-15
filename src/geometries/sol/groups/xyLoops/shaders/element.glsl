/***********************************************************************************************************************
 ***********************************************************************************************************************
 *
 * Subgroup managment
 *
 ***********************************************************************************************************************
 **********************************************************************************************************************/


/***********************************************************************************************************************
 * @struct
 * Z^2 subgroup (translation in the xy-plane of Sol)
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
    vec4 coords = a * group.dirA + b * group.dirB;
    return makeTranslation(Point(coords));
}