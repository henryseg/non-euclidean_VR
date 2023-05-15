/***********************************************************************************************************************
 * @struct
 * Cyclic group in H2E
 **********************************************************************************************************************/

struct GroupElement {
    int value; /**< integer coordinates of the element */
};

const GroupElement GROUP_IDENTITY = GroupElement(0);

GroupElement multiply(GroupElement elt1, GroupElement elt2){
    return GroupElement(elt1.value + elt2.value);
}

Isometry toIsometry(GroupElement elt) {
    if (elt.value == 0){
        return Isometry(mat4(1.), 0.);
    }
    else {
        vec4 u = 2. * float(elt.value) * group.halfTranslation;
        float s = length(u.xy);
        vec2 v = normalize(u.xy);
        float c1 = sinh(s);
        float c2 = cosh(s) - 1.;
        mat4 m = mat4(
        0, 0, v.x, 0,
        0, 0, v.y, 0,
        v.x, v.y, 0, 0,
        0, 0, 0, 0
        );
        mat4 matrix = mat4(1.) + c1 * m + c2 * m * m;
        return Isometry(matrix, 0.);
    }
}