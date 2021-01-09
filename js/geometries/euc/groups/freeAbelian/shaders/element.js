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
 * Free abelian group
 **********************************************************************************************************************/

struct GroupElement {
    ivec3 icoords; /**< integer coordinates of the element */
};

const float cubeHalfWidth = 0.8;
const GroupElement GROUP_IDENTITY = GroupElement(ivec3(0));

GroupElement multiply(GroupElement elt1, GroupElement elt2){
    return GroupElement(elt1.icoords + elt2.icoords);
}

//GroupElement groupInverse(GroupElement elt){
//    return GroupElement(-elt.icoords);
//}

Isometry toIsometry(GroupElement elt) {
    vec3 c = 2. * cubeHalfWidth * vec3(elt.icoords);
    mat4 matrix =  mat4(
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    c.x, c.y, c.z, 1
    );
    return Isometry(matrix);
}`;