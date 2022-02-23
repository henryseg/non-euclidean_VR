/***********************************************************************************************************************
 ***********************************************************************************************************************
 *
 * Subgroup managment
 *
 ***********************************************************************************************************************
 **********************************************************************************************************************/

/***********************************************************************************************************************
 * @struct
 * Element in the trivial group
 **********************************************************************************************************************/

struct GroupElement {
    bool fake; /**< A placeholder because a structure cannot be empty **/
};

const GroupElement GROUP_IDENTITY = GroupElement(true);

GroupElement multiply(GroupElement elt1, GroupElement elt2){
    return GroupElement(true);
}

//GroupElement groupInverse(GroupElement elt){
//    return GroupElement(true);
//}

Isometry toIsometry(GroupElement elt) {
    return IDENTITY;
}