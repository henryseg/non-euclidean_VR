/***********************************************************************************************************************
 ***********************************************************************************************************************
 *
 * Subgroup managment
 *
 ***********************************************************************************************************************
 **********************************************************************************************************************/

/***********************************************************************************************************************
 * @struct
 * Unit integer quaternions
 **********************************************************************************************************************/

struct GroupElement {
    ivec4 icoords; /**< integer coordinates of the element */
};

const GroupElement GROUP_IDENTITY = GroupElement(ivec4(0, 0, 0, 1));

GroupElement multiply(GroupElement elt1, GroupElement elt2){
    ivec4 c1 = elt1.icoords;
    ivec4 c2 = elt2.icoords;
    ivec4 c = ivec4(
    c1.x * c2.w + c1.w * c2.x + c1.y * c2.z - c1.z * c2.y,
    c1.y * c2.w + c1.w * c2.y + c1.z * c2.x - c1.x * c2.z,
    c1.z * c2.w + c1.w * c2.z + c1.x * c2.y - c1.y * c2.x,
    c1.w * c2.w - c1.x * c2.x - c1.y * c2.y - c1.z * c2.z
    );
    return GroupElement(c);
}

//GroupElement groupInverse(GroupElement elt){
//    return GroupElement(ivec4(-elt.icoords.x, -elt.icoords.y, -elt.icoords.z, elt.icoords.w));
//}

Isometry toIsometry(GroupElement elt) {
    vec4 c = vec4(elt.icoords);
    mat4 matrix =  mat4(
    c.w, c.z, c.y, c.x,
    -c.z, c.w, -c.x, c.y,
    -c.y, c.x, c.w, -c.z,
    -c.x, -c.y, c.z, c.w
    );
    return Isometry(matrix);
}