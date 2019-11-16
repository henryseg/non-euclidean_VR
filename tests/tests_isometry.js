QUnit.test("Equality of isometries", function (assert) {

    let isom1 = new Isometry([
        new THREE.Matrix4().set(
            1, 0, 0, 1,
            0, 1, 0, 2,
            0, 0, 1, 3,
            0, 0, 0, 1
        )
    ]);
    let isom2 = new Isometry([
        new THREE.Matrix4().set(
            1, 0, 0, 1,
            0, 1, 0, 2,
            0, 0, 1, 4,
            0, 0, 0, 1
        )
    ]);

    let isom3 = new Isometry([
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


QUnit.test("Identity", function (assert) {

    let isom = new Isometry([new THREE.Matrix4()]);
    assert.ok(IDENTITY.equals(isom));

});


QUnit.test("Multiplication of two isometries", function (assert) {

    let mat1 = new THREE.Matrix4().set(
        1, 0, 0, 1,
        0, 1, 0, 2,
        0, 0, 1, 3,
        0, 0, 0, 1
    );
    let isom1 = new Isometry([mat1]);

    let mat2 =  new THREE.Matrix4().set(
        1, 0, 0, 1,
        0, 1, 0, 2,
        0, 0, 1, 4,
        0, 0, 0, 1
    );
    let isom2 = new Isometry([mat2]);

    let computed = isom1.multiply(isom2);
    let expected = new Isometry([
        new THREE.Matrix4().set(
            1, 0, 0, 2,
            0, 1, 0, 4,
            0, 0, 1, 7,
            0, 0, 0, 1
        )
    ]);

    assert.ok(computed.equals(expected), "Check if the product is correct");
    assert.ok(isom1.matrix.equals(mat1), "Check if the first isom has not changed");
    assert.ok(isom2.matrix.equals(mat2), "Check if the second isom has not changed");
});


QUnit.test("Inverse of an isometry", function (assert) {

    let isom1 = new Isometry([
        new THREE.Matrix4().set(
            1, 0, 0, 1,
            0, 1, 0, 2,
            0, 0, 1, 3,
            0, 0, 0, 1
        )
    ]);
    let isom2 = new Isometry([
        new THREE.Matrix4().set(
            1, 0, 0, -1,
            0, 1, 0, -2,
            0, 0, 1, -3,
            0, 0, 0, 1
        )
    ]);

    assert.ok(isom1.inverse().equals(isom2));
});

QUnit.test("Translating a point by an isometry", function (assert) {

    let isom = new Isometry([
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