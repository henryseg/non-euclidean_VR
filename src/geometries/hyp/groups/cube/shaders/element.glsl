/***********************************************************************************************************************
 ***********************************************************************************************************************
 *
 * Subgroup managment
 *
 ***********************************************************************************************************************
 **********************************************************************************************************************/

/***********************************************************************************************************************
 * @struct
 * Translation group whose fundamental domain is an ideal cube in H3
 **********************************************************************************************************************/

struct GroupElement {
    QuadRingMatrix matrix; /**< tha matrix written in a quadratic field */
};

const GroupElement GROUP_IDENTITY = GroupElement(QUAD_RING_IDENTITY);

GroupElement multiply(GroupElement elt1, GroupElement elt2){
    return GroupElement(multiply(elt1.matrix, elt2.matrix));
}

//GroupElement groupInverse(GroupElement elt){
//    return GroupElement(-elt.icoords);
//}

Isometry toIsometry(GroupElement elt) {
    return Isometry(toMat4(elt.matrix));
}