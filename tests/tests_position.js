QUnit.test("Equality of positions", function (assert) {

    let boost1 = new Isometry([
        new THREE.Matrix4().set(
            1, 0, 0, 1,
            0, 1, 0, 2,
            0, 0, 1, 3,
            0, 0, 0, 1
        )
    ]);

    let boost2 = new Isometry([
        new THREE.Matrix4().set(
            1, 0, 0, 1,
            0, 1, 0, 2,
            0, 0, 1, 3,
            0, 0, 0, 1
        )
    ]);

    let boost3 = new Isometry([
        new THREE.Matrix4().set(
            1, 0, 0, 1,
            0, 1, 0, 2,
            0, 0, 1, 4,
            0, 0, 0, 1
        )
    ]);


    let facing1 = new THREE.Matrix4();
    let facing2 = new THREE.Matrix4();
    let facing3 = new THREE.Matrix4().set(
        0, -1, 0, 0,
        1, 0, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    );

    let position1 = new Position(boost1, facing1);
    let position2 = new Position(boost2, facing2);
    assert.ok(position1.equals(position2));

    position2 = new Position(boost3, facing2);
    assert.notOk(position1.equals(position2));

    position2 = new Position(boost2, facing3);
    assert.notOk(position1.equals(position2));

    position2 = new Position(boost3, facing2);
    assert.notOk(position1.equals(position2));

});

QUnit.test("Translation of a positions", function (assert) {

    let boost = new Isometry([new THREE.Matrix4().set(
        1, 0, 0, 2,
        0, 1, 0, 3,
        0, 0, 1, 4,
        0, 0, 0, 1
    )]);
    let facing = new THREE.Matrix4();
    let position = new Position(boost, facing);

    let isom = new Isometry([
        new THREE.Matrix4().set(
            1, 0, 0, 1,
            0, 1, 0, 2,
            0, 0, 1, 3,
            0, 0, 0, 1
        )
    ]);

    let trans = new Isometry([
        new THREE.Matrix4().set(
            1, 0, 0, 3,
            0, 1, 0, 5,
            0, 0, 1, 7,
            0, 0, 0, 1
        )
    ]);
    let computed = position.translateBy(isom);
    let expected = new Position(trans, facing);


    assert.ok(computed.equals(expected));
});


QUnit.test("Local translation of a positions", function (assert) {

    let boost = new Isometry([new THREE.Matrix4().set(
        1, 0, 0, 2,
        0, 1, 0, 3,
        0, 0, 1, 4,
        0, 0, 0, 1
    )]);
    let facing = new THREE.Matrix4();
    let position = new Position(boost, facing);

    let isom = new Isometry([
        new THREE.Matrix4().set(
            1, 0, 0, 1,
            0, 1, 0, 2,
            0, 0, 1, 3,
            0, 0, 0, 1
        )
    ]);

    let trans = new Isometry([
        new THREE.Matrix4().set(
            1, 0, 0, 3,
            0, 1, 0, 5,
            0, 0, 1, 7,
            0, 0, 0, 1
        )
    ]);
    let computed = position.localTranslateBy(isom);
    let expected = new Position(trans, facing);


    assert.ok(computed.equals(expected));
});


QUnit.test("Rotation of the facing", function (assert) {

    let boost = new Isometry([new THREE.Matrix4().set(
        1, 0, 0, 2,
        0, 1, 0, 3,
        0, 0, 1, 4,
        0, 0, 0, 1
    )]);
    let facing = new THREE.Matrix4().set(
        0, -1, 0, 0,
        1, 0, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    );
    let position = new Position(boost, facing);

    let rotation = new THREE.Matrix4().set(
        0, 1, 0, 0,
        -1, 0, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    );

    let rotatedFacing = new THREE.Matrix4();
    let computed = position.rotateFacingBy(rotation);
    let expected = new Position(boost, rotatedFacing);

    assert.ok(computed.equals(expected));
});



QUnit.test("Flowing a position", function (assert) {

    let boost = new Isometry([new THREE.Matrix4().set(
        1, 0, 0, 2,
        0, 1, 0, 3,
        0, 0, 1, 4,
        0, 0, 0, 1
    )]);
    let facing = new THREE.Matrix4().set(
        0, -1, 0, 0,
        1, 0, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    );
    let position = new Position(boost, facing);

    let v = new THREE.Vector3(1,0,0);

    let expectedBoost = new Isometry([new THREE.Matrix4().set(
        1, 0, 0, 3,
        0, 1, 0, 3,
        0, 0, 1, 4,
        0, 0, 0, 1
    )]);

    let computed = position.flow(v);
    let expected = new Position(expectedBoost, facing);

    assert.ok(computed.equals(expected));
});



QUnit.test("Rotation of a vector by the facing", function (assert) {

    let boost = new Isometry([new THREE.Matrix4().set(
        1, 0, 0, 2,
        0, 1, 0, 3,
        0, 0, 1, 4,
        0, 0, 0, 1
    )]);
    let facing = new THREE.Matrix4().set(
        0, -1, 0, 0,
        1, 0, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    );
    let position = new Position(boost, facing);

    let v = new THREE.Vector3(1,0,0);

    let computed = position.rotateByFacing(v);
    let expected = new THREE.Vector3(0,1,0);

    assert.ok(computed.equals(expected));
});

QUnit.test("Inverse of a position", function (assert) {

    let boost = new Isometry([new THREE.Matrix4().set(
        1, 0, 0, 2,
        0, 1, 0, 3,
        0, 0, 1, 4,
        0, 0, 0, 1
    )]);
    let facing = new THREE.Matrix4().set(
        0, -1, 0, 0,
        1, 0, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    );

    let position = new Position(boost, facing);

    let invBoost = new Isometry([new THREE.Matrix4().set(
        1, 0, 0, -2,
        0, 1, 0, -3,
        0, 0, 1, -4,
        0, 0, 0, 1
    )]);
    let invFacing = new THREE.Matrix4().set(
        0, 1, 0, 0,
        -1, 0, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    );


    let computed = position.inverse();
    let expected = new Position(invBoost, invFacing);

    assert.ok(computed.equals(expected));
});


QUnit.test("Forward/right/up vector", function (assert) {

    let boost = new Isometry([new THREE.Matrix4().set(
        1, 0, 0, 2,
        0, 1, 0, 3,
        0, 0, 1, 4,
        0, 0, 0, 1
    )]);
    let facing = new THREE.Matrix4().set(
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    );
    let position = new Position(boost, facing);

    let computed = position.getFwdVector();
    let expected = new THREE.Vector3(0,0,-1);
    assert.ok(computed.equals(expected));

    computed = position.getRightVector();
    expected = new THREE.Vector3(1,0,0);
    assert.ok(computed.equals(expected));

    computed = position.getUpVector();
    expected = new THREE.Vector3(0,1,0);
    assert.ok(computed.equals(expected));

    facing = new THREE.Matrix4().set(
        0, -1, 0, 0,
        1, 0, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    );
    position = new Position(boost, facing);

    computed = position.getFwdVector();
    expected = new THREE.Vector3(0,0,-1);
    assert.ok(computed.equals(expected));

    computed = position.getRightVector();
    expected = new THREE.Vector3(0,1,0);
    assert.ok(computed.equals(expected));

    computed = position.getUpVector();
    expected = new THREE.Vector3(-1,0,0);
    assert.ok(computed.equals(expected));
});