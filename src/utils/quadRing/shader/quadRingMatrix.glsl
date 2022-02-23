/***********************************************************************************************************************
 * @struct
 * 4x4-matrix over a quadratic field
 * Using 16 entries (with 2 coefficient each) seems too much for OpenGL.
 * Instead we use two matrices a, b
 * the ij-entry of the matrix is meant to be a[i,j] + b[i,j] sqrt(d)
 **********************************************************************************************************************/

struct QuadRingMatrix {
    mat4 a;
    mat4 b;
};

const QuadRingMatrix QUAD_RING_IDENTITY = QuadRingMatrix(mat4(1), mat4(0));

QuadRingMatrix reduce(QuadRingMatrix m){
    m.a[0] = round(m.a[0]);
    m.b[0] = round(m.b[0]);

    m.a[1] = round(m.a[1]);
    m.b[1] = round(m.b[1]);

    m.a[2] = round(m.a[2]);
    m.b[2] = round(m.b[2]);

    m.a[3] = round(m.a[3]);
    m.b[3] = round(m.b[3]);
    
    return m;
}

QuadRingMatrix multiply(QuadRingMatrix m1, QuadRingMatrix m2){
    mat4 a = m1.a * m2.a + float(QUAD_RING_D) * m1.b * m2.b;
    mat4 b = m1.a * m2.b + m1.b * m2.a;
    QuadRingMatrix res = QuadRingMatrix(a, b);
    return reduce(res);
}

mat4 toMat4(QuadRingMatrix m){
    return m.a + sqrt(float(QUAD_RING_D)) * m.b;
}