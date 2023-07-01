struct GroupElement {
    ivec2 coords;
};

const GroupElement GROUP_IDENTITY = GroupElement(ivec2(0, 0));

GroupElement multiply(GroupElement elt1, GroupElement elt2) {
    ivec2 coords = elt1.coords + elt2.coords;
    coords.x = int(mod(float(coords.x), group.n));
    return GroupElement(coords);
}

Isometry toIsometry(GroupElement elt) {
    float angle = 2. * float(elt.coords.x) * PI / group.n;
    float shift = 2. * float(elt.coords.y) * group.halfHeight;
    float c = cos(angle);
    float s = sin(angle);
    mat4 matrix = mat4(
        1, 0, 0, 0,
        0, c, s, 0,
        0, -s, c, 0,
        0, 0, 0, 1
    );
    return Isometry(matrix, shift);
}