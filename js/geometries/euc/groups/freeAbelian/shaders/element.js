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

const GroupElement GROUP_IDENTITY = GroupElement(ivec3(0));

GroupElement multiply(GroupElement elt1, GroupElement elt2){
    return GroupElement(elt1.icoords + elt2.icoords);
}

//GroupElement groupInverse(GroupElement elt){
//    return GroupElement(-elt.icoords);
//}

Isometry toIsometry(GroupElement elt) {
    vec3 c = vec3(elt.icoords);
    vec4 t = 2. * (c.x * group.halfTranslationA + c.y * group.halfTranslationB + c.z * group.halfTranslationC);
    mat4 matrix =  mat4(
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    t.x, t.y, t.z, 1
    );
    return Isometry(matrix);
}`;