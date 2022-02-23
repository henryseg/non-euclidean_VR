/***********************************************************************************************************************
 ***********************************************************************************************************************
 *
 * Subgroup managment
 *
 ***********************************************************************************************************************
 **********************************************************************************************************************/

const float PHI = 0.5 * (1. + sqrt(5.));
const float DENUM = 1. / (PHI + 2.);
const float TAU = 2. * log(PHI);

/***********************************************************************************************************************
 * @struct
 * Integral Heisenberg group
 **********************************************************************************************************************/

struct GroupElement {
    vec3 coords; /**< integer coordinates of the element */
    mat3 matrix; /**< matrix used for computing the suspension */
};

const GroupElement GROUP_IDENTITY = GroupElement(vec3(0), mat3(1));

GroupElement multiply(GroupElement elt1, GroupElement elt2){
    vec3 coords = elt1.coords + elt1.matrix * elt2.coords;
    mat3 matrix = elt1.matrix * elt2.matrix;
    return GroupElement(coords, matrix);
}

Isometry toIsometry(GroupElement elt) {
    float a = elt.coords.x;
    float b = elt.coords.y;
    float c = elt.coords.z;
    vec4 coords = vec4((a * PHI + b) * DENUM, (-a + b * PHI) * DENUM, c * TAU, 1);
    return makeTranslation(Point(coords));
}