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
 * Unit integer quaternions
 **********************************************************************************************************************/

struct GroupElement {
    ivec4 icoords; /**< integer coordinates of the element */
};

const GroupElement GROUP_IDENTITY = GroupElement(ivec4(0, 0, 0, 1));

GroupElement multiply(GroupElement elt1, GroupElement elt2){
    // there is no integer matrix in GLSL.
    // so we must goe back and forth between integer coordinates and float coordinates
    vec4 c1 = vec4(elt1.icoords);
    vec4 c2 = vec4(elt2.icoords);
    mat4 matrix =  mat4(
    c1.w, c1.x, c1.y, c1.z,
    -c1.x, c1.w, c1.z, -c1.y,
    -c1.y, -c1.z, c1.w, c1.x,
    -c1.z, c1.y, -c1.x, c1.w
    );
    vec4 c = matrix * c2;
    return GroupElement(ivec4(c));
}

GroupElement groupInverse(GroupElement elt){
    return GroupElement(ivec4(-elt.icoords.x, -elt.icoords.y, -elt.icoords.z, elt.icoords.w));
}

Isometry toIsometry(GroupElement elt) {
    vec4 c = vec4(elt.icoords);
    mat4 matrix =  mat4(
    c.w, c.z, c.y, c.x,
    -c.z, c.w, -c.x, c.y,
    -c.y, c.x, c.w, -c.z,
    -c.x, -c.y, c.z, c.w
    );
    return Isometry(matrix);
}`;