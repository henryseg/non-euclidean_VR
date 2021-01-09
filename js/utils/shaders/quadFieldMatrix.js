// language=GLSL
export default `//

/***********************************************************************************************************************
 * @struct
 * 4x4-matrix over a quadratic field
 * As for strandard matrices, we use a colum-major order
 **********************************************************************************************************************/

struct qmat4 {
    QuadFieldElt c11;
    QuadFieldElt c21;
    QuadFieldElt c31;
    QuadFieldElt c41;
    QuadFieldElt c12;
    QuadFieldElt c22;
    QuadFieldElt c32;
    QuadFieldElt c42;
    QuadFieldElt c13;
    QuadFieldElt c23;
    QuadFieldElt c33;
    QuadFieldElt c43;
    QuadFieldElt c14;
    QuadFieldElt c24;
    QuadFieldElt c34;
    QuadFieldElt c44;
};

const qmat4 QUAD_FIELD_IDENTITY = qmat4(
QUAD_FIELD_ONE, QUAD_FIELD_ZERO, QUAD_FIELD_ZERO, QUAD_FIELD_ZERO,
QUAD_FIELD_ZERO, QUAD_FIELD_ONE, QUAD_FIELD_ZERO, QUAD_FIELD_ZERO,
QUAD_FIELD_ZERO, QUAD_FIELD_ZERO, QUAD_FIELD_ONE, QUAD_FIELD_ZERO,
QUAD_FIELD_ZERO, QUAD_FIELD_ZERO, QUAD_FIELD_ZERO, QUAD_FIELD_ONE
);

qmat4 multiply(qmat4 m1, qmat4 m2){
    QuadFieldElt c11 = add(
    multiply(m1.c11, m2.c11),
    multiply(m1.c12, m2.c21),
    multiply(m1.c13, m2.c31),
    multiply(m1.c14, m2.c41)
    );
    QuadFieldElt c21= add(
    multiply(m1.c21, m2.c11),
    multiply(m1.c22, m2.c21),
    multiply(m1.c23, m2.c31),
    multiply(m1.c24, m2.c41)
    );
    QuadFieldElt c31= add(
    multiply(m1.c31, m2.c11),
    multiply(m1.c32, m2.c21),
    multiply(m1.c33, m2.c31),
    multiply(m1.c34, m2.c41)
    );
    QuadFieldElt c41= add(
    multiply(m1.c41, m2.c11),
    multiply(m1.c42, m2.c21),
    multiply(m1.c43, m2.c31),
    multiply(m1.c44, m2.c41)
    );
    QuadFieldElt c12= add(
    multiply(m1.c11, m2.c12),
    multiply(m1.c12, m2.c22),
    multiply(m1.c13, m2.c32),
    multiply(m1.c14, m2.c42)
    );
    QuadFieldElt c22= add(
    multiply(m1.c21, m2.c12),
    multiply(m1.c22, m2.c22),
    multiply(m1.c23, m2.c32),
    multiply(m1.c24, m2.c42)
    );
    QuadFieldElt c32= add(
    multiply(m1.c31, m2.c12),
    multiply(m1.c32, m2.c22),
    multiply(m1.c33, m2.c32),
    multiply(m1.c34, m2.c42)
    );
    QuadFieldElt c42= add(
    multiply(m1.c41, m2.c12),
    multiply(m1.c42, m2.c22),
    multiply(m1.c43, m2.c32),
    multiply(m1.c44, m2.c42)
    );
    QuadFieldElt c13= add(
    multiply(m1.c11, m2.c13),
    multiply(m1.c12, m2.c23),
    multiply(m1.c13, m2.c33),
    multiply(m1.c14, m2.c43)
    );
    QuadFieldElt c23= add(
    multiply(m1.c21, m2.c13),
    multiply(m1.c22, m2.c23),
    multiply(m1.c23, m2.c33),
    multiply(m1.c24, m2.c43)
    );
    QuadFieldElt c33= add(
    multiply(m1.c31, m2.c13),
    multiply(m1.c32, m2.c23),
    multiply(m1.c33, m2.c33),
    multiply(m1.c34, m2.c43)
    );
    QuadFieldElt c43= add(
    multiply(m1.c41, m2.c13),
    multiply(m1.c42, m2.c23),
    multiply(m1.c43, m2.c33),
    multiply(m1.c44, m2.c43)
    );
    QuadFieldElt c14= add(
    multiply(m1.c11, m2.c14),
    multiply(m1.c12, m2.c24),
    multiply(m1.c13, m2.c34),
    multiply(m1.c14, m2.c44)
    );
    QuadFieldElt c24= add(
    multiply(m1.c21, m2.c14),
    multiply(m1.c22, m2.c24),
    multiply(m1.c23, m2.c34),
    multiply(m1.c24, m2.c44)
    );
    QuadFieldElt c34= add(
    multiply(m1.c31, m2.c14),
    multiply(m1.c32, m2.c24),
    multiply(m1.c33, m2.c34),
    multiply(m1.c34, m2.c44)
    );
    QuadFieldElt c44= add(
    multiply(m1.c41, m2.c14),
    multiply(m1.c42, m2.c24),
    multiply(m1.c43, m2.c34),
    multiply(m1.c44, m2.c44)
    );
    return qmat4(
    c11, c21, c31, c41,
    c12, c22, c32, c42,
    c13, c23, c33, c43,
    c14, c24, c34, c44
    );
}


mat4 toMat4(qmat4 m){
    return mat4(
    toFloat(m.c11), toFloat(m.c21), toFloat(m.c31), toFloat(m.c41),
    toFloat(m.c12), toFloat(m.c22), toFloat(m.c32), toFloat(m.c42),
    toFloat(m.c13), toFloat(m.c23), toFloat(m.c33), toFloat(m.c43),
    toFloat(m.c14), toFloat(m.c24), toFloat(m.c34), toFloat(m.c44)
    );
}
`;