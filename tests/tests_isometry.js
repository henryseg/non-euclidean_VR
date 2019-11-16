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


QUnit.test("Multiplication of two isometries", function (assert) {

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
            1, 0, 0, 2,
            0, 1, 0, 4,
            0, 0, 1, 7,
            0, 0, 0, 1
        )
    ]);
    assert.ok(isom1.multiply(isom2).equals(isom3));
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