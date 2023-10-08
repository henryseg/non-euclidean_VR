struct GroupElement {
    ivec3 irotation;
    ivec3 itranslation;
};

const GroupElement GROUP_IDENTITY = GroupElement(ivec3(1), ivec3(0));

GroupElement multiply(GroupElement elt1, GroupElement elt2){
    ivec3 rotation = elt1.irotation * elt2.irotation;
    ivec3 transaltion = elt1.itranslation + elt1.irotation * elt2.itranslation;
    return GroupElement(rotation, transaltion);
}

Isometry toIsometry(GroupElement elt) {
    ivec3 a = elt.irotation;
    vec3 t = group.length * vec3(elt.itranslation);
    mat4 matrix =  mat4(
    a.x, 0, 0, 0,
    0, a.y, 0, 0,
    0, 0, a.z, 0,
    t.x, t.y, t.z, 1
    );
    return Isometry(matrix);
}