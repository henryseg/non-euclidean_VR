/***********************************************************************************************************************
 ***********************************************************************************************************************
 *
 * Subgroup managment
 *
 ***********************************************************************************************************************
 **********************************************************************************************************************/

/***********************************************************************************************************************
 * @struct
 * Group element based on isometries
 **********************************************************************************************************************/

struct GroupElement {
    Isometry isom; /**< The underlying isometry **/
};

const GroupElement GROUP_IDENTITY = GroupElement(IDENTITY);

GroupElement multiply(GroupElement elt1, GroupElement elt2){
    return GroupElement(multiply(elt1.isom, elt2.isom));
}

//GroupElement groupInverse(GroupElement elt){
//    return GroupElement(geomInverse(elt.isom));
//}

Isometry toIsometry(GroupElement elt) {
    return elt.isom;
}