QUnit.test("Constructor", function (assert) {

    let isom = new Isometry();
    assert.ok(isom.matrix.equals(new THREE.Matrix4()));
});

QUnit.test("Set", function (assert) {

    let isom = new Isometry().set([
        new THREE.Matrix4().set(
            1, 0, 0, 1,
            0, 1, 0, 2,
            0, 0, 1, 3,
            0, 0, 0, 1
        )
    ]);
    assert.ok(isom.matrix.equals(new THREE.Matrix4().set(
        1, 0, 0, 1,
        0, 1, 0, 2,
        0, 0, 1, 3,
        0, 0, 0, 1
    )));
});


QUnit.test("Equality of isometries", function (assert) {

    let isom1 = new Isometry().set([
        new THREE.Matrix4().set(
            1, 0, 0, 1,
            0, 1, 0, 2,
            0, 0, 1, 3,
            0, 0, 0, 1
        )
    ]);
    let isom2 = new Isometry().set([
        new THREE.Matrix4().set(
            1, 0, 0, 1,
            0, 1, 0, 2,
            0, 0, 1, 4,
            0, 0, 0, 1
        )
    ]);

    let isom3 = new Isometry().set([
        new THREE.Matrix4().set(
            1, 0, 0, 1,
            0, 1, 0, 2,
            0, 0, 1, 3,
            0, 0, 0, 1
        )
    ]);
    assert.notOk(isom1.equals(isom2));
    assert.ok(isom1.equals(isom3));
});


QUnit.test("Multiplication of two isometries", function (assert) {

    let isom1 = new Isometry().set([
        new THREE.Matrix4().set(
            1, 0, 0, 1,
            0, 1, 0, 2,
            0, 0, 1, 3,
            0, 0, 0, 1
        )
    ]);
    let isom2  = new Isometry().set([
        new THREE.Matrix4().set(
            1, 0, 0, 1,
            0, 1, 0, 2,
            0, 0, 1, 4,
            0, 0, 0, 1
        )
    ]);

    isom1.multiply(isom2);
    let expected = new Isometry().set([
        new THREE.Matrix4().set(
            1, 0, 0, 2,
            0, 1, 0, 4,
            0, 0, 1, 7,
            0, 0, 0, 1
        )
    ]);

    assert.ok(isom1.equals(expected), "Check if the product is correct");
    assert.ok(isom2.matrix.equals(new THREE.Matrix4().set(
        1, 0, 0, 1,
        0, 1, 0, 2,
        0, 0, 1, 4,
        0, 0, 0, 1
    )), "Check if the second isom has not changed");


    isom1 = new Isometry().set([
        new THREE.Matrix4().set(
            1, 0, 0, 1,
            0, 1, 0, 2,
            0, 0, 1, 3,
            0, 0, 0, 1
        )
    ]);
    isom2  = new Isometry().set([
        new THREE.Matrix4().set(
            1, 0, 0, 1,
            0, 1, 0, 2,
            0, 0, 1, 4,
            0, 0, 0, 1
        )
    ]);

    isom2.premultiply(isom1);
    expected = new Isometry().set([
        new THREE.Matrix4().set(
            1, 0, 0, 2,
            0, 1, 0, 4,
            0, 0, 1, 7,
            0, 0, 0, 1
        )
    ]);

    assert.ok(isom2.equals(expected), "Check if the product is correct");
    assert.ok(isom1.matrix.equals(new THREE.Matrix4().set(
        1, 0, 0, 1,
        0, 1, 0, 2,
        0, 0, 1, 3,
        0, 0, 0, 1
    )), "Check if the second isom has not changed");

});


QUnit.test("Inverse of an isometry", function (assert) {

    let isom = new Isometry().set([
        new THREE.Matrix4().set(
            1, 0, 0, 1,
            0, 1, 0, 2,
            0, 0, 1, 3,
            0, 0, 0, 1
        )
    ]);

    let computed = new Isometry().getInverse(isom)
    let expected = new Isometry().set([
        new THREE.Matrix4().set(
            1, 0, 0, -1,
            0, 1, 0, -2,
            0, 0, 1, -3,
            0, 0, 0, 1
        )
    ]);

    assert.ok(computed.equals(expected));
});

QUnit.test("Translating a point by an isometry", function (assert) {

    let isom = new Isometry().set([
        new THREE.Matrix4().set(
            1, 0, 0, 1,
            0, 1, 0, 2,
            0, 0, 1, 3,
            0, 0, 0, 1
        )
    ]);
    let point = new THREE.Vector4(0,0,0,1);
    let trans = new THREE.Vector4(1,2,3,1);

    assert.ok(isom.translate(point).equals(trans));
});