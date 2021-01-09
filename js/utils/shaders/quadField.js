// language=GLSL
export default `//

/***********************************************************************************************************************
 ***********************************************************************************************************************
 *
 * Shader part for quadratic extension of Q
 *
 ***********************************************************************************************************************
 **********************************************************************************************************************/

/**
 * Return the GCD of the three elements
 */
int gcd(int a, int b, int c){
    int n = 2 * max (abs(a), abs(b), abs(c));
    int temp;
    for (int i = 0; i < n; i++){
        if (b == 0 && c == 0){
            return a;
        }
        if (c == 0){
            temp = b;
            b = mod(a, temp);
            a = temp;

        }
        else {
            temp = c;
            c = mod(b, temp);
            b = mod(a, temp);
            a = temp;
        }
    }
    // this part of the code should never be acheived
    return -1;
}

/** 
 * @const
 * square of the adjoint root 
 */
const int QUAD_FIELD_D = 3;

/***********************************************************************************************************************
 * @struct
 * Element of the quadratic field
 **********************************************************************************************************************/

struct QuadFieldElt {
    int a;
    int b;
    int c;
};


const QuadFieldElt QUAD_FIELD_ZERO = QuadFieldElt(0, 0, 1);
const QuadFieldElt QUAD_FIELD_ONE = QuadFieldElt(1, 0, 1);

bool isZero(QuadFieldElt elt){
    return elt.a == 0 && elt.b == 0;
}

bool equal(QuadFieldElt elt1, QuadFieldElt el2){
    return elt1.a * elt2.c == elt2.a * elt1.c && elt1.b * elt2.c == elt2.b * elt1.c;
}

QuadFieldElt reduce(QuadFieldElt elt){
    int n = gcd(elt.a, elt.b, elt.c);
    elt.a = elt.a / n;
    elt.b = elt.b / n;
    elt.c = elt.c / n;
    return elt;
}

QuadFieldElt multiply(QuadFieldElt elt1, QuadFieldElt elt2){
    int a = elt1.a * elt2.a + QUAD_FIELD_D * elt1.b * elt2.b;
    int b = elt1.a * elt2.b + elt1.b * elt2.a;
    int c = elt1.c * elt2.c;
    QuadFieldElt res = QuadFieldElt(a, b, c);
    return reduce(res);
}

QuadFieldElt multiply(QuadFieldElt elt1, QuadFieldElt elt2, QuadFieldElt elt3) {
    return multiply(elt1, multiply(elt2, elt3));
}

QuadFieldElt multiply(QuadFieldElt elt1, QuadFieldElt elt2, QuadFieldElt elt3, QuadFieldElt elt4) {
    return multiply(elt1, multiply(elt2, elt3, elt4));
}


QuadFieldElt add(QuadFieldElt elt1, QuadFieldElt elt2){
    int a = elt1.a * elt2.c + elt2.a * elt1.c;
    int b = elt1.b * elt2.c + elt2.b * elt1.c;
    int c = elt1.c * elt2.c;
    QuadFieldElt res = QuadFieldElt(a, b, c);
    return reduce(res);
}

QuadFieldElt add(QuadFieldElt elt1, QuadFieldElt elt2, QuadFieldElt elt3) {
    return add(elt1, add(elt2, elt3));;
}

QuadFieldElt add(QuadFieldElt elt1, QuadFieldElt elt2, QuadFieldElt elt3, QuadFieldElt elt4) {
    return add(elt1, add(elt2, elt3, elt4));
}

QuadFieldElt sub(QuadFieldElt elt1, QuadFieldElt elt2){
    int a = elt1.a * elt2.c - elt2.a * elt1.c;
    int b = elt1.b * elt2.c - elt2.b * elt1.c;
    int c = elt1.c * elt2.c;
    QuadFieldElt res = QuadFieldElt(a, b, c);
    return reduce(res);
}
/**
 * Compute the inverse
 * The element is assumed to be non-zero
 */
QuadFieldElt invert(QuadFieldElt elt){
    int a = elt.a * elt.c;
    int b = - elt.b * elt.c;
    int c = elt.a * elt.a - QUAD_FIELD_D * elt.b * elt.b;
    QuadFieldElt res = QuadFieldElt(a, b, c);
    return reduce(res);
}

float toFloat(QuadFieldElt elt){
    return (float(elt.a) + float(elt.b) * sqrt(QUAD_FIELD_D))/float(elt.c);
}



`;
