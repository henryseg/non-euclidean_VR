// language=GLSL
export default `//

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

//GroupElement groupInverse(GroupElement elt){
//    ivec3 c = elt.icoords;
//    return GroupElement(ivec3(-c.x, -c.y, -c.z + c.x * c.y));
//}

Isometry toIsometry(GroupElement elt) {
    vec3 c = vec3(elt.icoords);
    mat4 matrix =  mat4(
    1, 0, -0.5 * c.y, 0,
    0, 1, 0.5 * c.x, 0,
    0, 0, 1, 0,
    c.x, c.y, c.z-0.5 * c.x * c.y, 1
    );
    return Isometry(matrix,true);
}`;