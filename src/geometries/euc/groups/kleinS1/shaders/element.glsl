/***********************************************************************************************************************
 * @struct
 * Fundamental group of the Klein bottle x S^1
 **********************************************************************************************************************/

struct GroupElement {
    ivec3 icoords; /**< integer coordinates of the element */
};

const GroupElement GROUP_IDENTITY = GroupElement(ivec3(0));

GroupElement multiply(GroupElement elt1, GroupElement elt2){
    int flip = 1 - 2 * int(mod(float(elt1.icoords.x), 2.));
    elt2.icoords.y = flip * elt2.icoords.y;
    return GroupElement(elt1.icoords + elt2.icoords);
}

Isometry toIsometry(GroupElement elt) {
    vec3 t = 2. * group.halfWidth * vec3(elt.icoords);
    float flip = 1. - 2. * mod(float(elt.icoords.x), 2.);
    mat4 matrix =  mat4(
    1, 0, 0, 0,
    0, flip, 0, 0,
    0, 0, flip, 0,
    t.x, t.y, t.z, 1
    );
    return Isometry(matrix);
}