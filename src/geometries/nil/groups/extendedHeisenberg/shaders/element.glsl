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
    return GroupElement(ivec3(c1.x + c2.x, c1.y + c2.y, c1.z + c2.z + group.root * c1.x * c2.y));
}

//GroupElement groupInverse(GroupElement elt){
//    ivec3 c = elt.icoords;
//    return GroupElement(ivec3(-c.x, -c.y, -c.z + group.root * c.x * c.y));
//}

Isometry toIsometry(GroupElement elt) {
    vec3 c = vec3(elt.icoords);
    vec4 aux = c.x * group.translationA + c.y * group.translationB;
    float root_det = group.translationC.z;
    mat4 matrix =  mat4(
    1, 0, -0.5 * aux.y, 0,
    0, 1, 0.5 * aux.x, 0,
    0, 0, 1, 0,
    aux.x, aux.y, aux.z -0.5 * (float(group.root) * c.x * c.y - 2. * c.z) * root_det, 1
    );
    return Isometry(matrix, true);
}