QUnit.test("Constructor", function (assert) {

    let position = new Position();
    assert.ok(position.boost.equals(new Isometry()));
    assert.ok(position.facing.equals(new THREE.Matrix4()));
});


QUnit.test("Set", function (assert) {

    let boost = new Isometry().set([
        new THREE.Matrix4().set(
            1, 0, 0, 1,
            0, 1, 0, 2,
            0, 0, 1, 3,
            0, 0, 0, 1
        )
    ]);

    let facing = new THREE.Matrix4().set(
        0, -1, 0, 0,
        1, 0, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    );


    let position = new Position().set(boost, facing);
    assert.ok(position.boost.equals(new Isometry().set([
        new THREE.Matrix4().set(
            1, 0, 0, 1,
            0, 1, 0, 2,
            0, 0, 1, 3,
            0, 0, 0, 1
        )
    ])));
    assert.ok(position.facing.equals(new THREE.Matrix4().set(
        0, -1, 0, 0,
        1, 0, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    )));
});


QUnit.test("Equality of positions", function (assert) {

    let boost1 = new Isometry().set([
        new THREE.Matrix4().set(
            1, 0, 0, 1,
            0, 1, 0, 2,
            0, 0, 1, 3,
            0, 0, 0, 1
        )
    ]);

    let boost2 = new Isometry().set([
        new THREE.Matrix4().set(
            1, 0, 0, 1,
            0, 1, 0, 2,
            0, 0, 1, 3,
            0, 0, 0, 1
        )
    ]);

    let boost3 = new Isometry().set([
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

    let position1 = new Position().set(boost1, facing1);
    let position2 = new Position().set(boost2, facing2);
    assert.ok(position1.equals(position2));

    position2 = new Position().set(boost3, facing2);
    assert.notOk(position1.equals(position2));

    position2 = new Position().set(boost2, facing3);
    assert.notOk(position1.equals(position2));

    position2 = new Position().set(boost3, facing2);
    assert.notOk(position1.equals(position2));

});


QUnit.test("Translation of a position", function (assert) {

    let boost = new Isometry().set([new THREE.Matrix4().set(
        1, 0, 0, 2,
        0, 1, 0, 3,
        0, 0, 1, 4,
        0, 0, 0, 1
    )]);
    let facing = new THREE.Matrix4();
    let position = new Position().set(boost, facing);
    //console.log('pre mult',position.boost.matrix.elements);
    //console.log('boost',boost.matrix.elements);

    let isom = new Isometry().set([
        new THREE.Matrix4().set(
            1, 0, 0, 1,
            0, 1, 0, 2,
            0, 0, 1, 3,
            0, 0, 0, 1
        )
    ]);

    let trans = new Isometry().set([
        new THREE.Matrix4().set(
            1, 0, 0, 3,
            0, 1, 0, 5,
            0, 0, 1, 7,
            0, 0, 0, 1
        )
    ]);
    position.translateBy(isom);
    let expected = new Position().set(trans, new THREE.Matrix4());

    assert.ok(position.equals(expected));
});


QUnit.test("Local translation of a positions", function (assert) {

    let boost = new Isometry().set([new THREE.Matrix4().set(
        1, 0, 0, 2,
        0, 1, 0, 3,
        0, 0, 1, 4,
        0, 0, 0, 1
    )]);
    let facing = new THREE.Matrix4();
    let position = new Position().set(boost, facing);

    let isom = new Isometry().set([
        new THREE.Matrix4().set(
            1, 0, 0, 1,
            0, 1, 0, 2,
            0, 0, 1, 3,
            0, 0, 0, 1
        )
    ]);

    let trans = new Isometry().set([
        new THREE.Matrix4().set(
            1, 0, 0, 3,
            0, 1, 0, 5,
            0, 0, 1, 7,
            0, 0, 0, 1
        )
    ]);
    position.localTranslateBy(isom);
    let expected = new Position().set(trans, new THREE.Matrix4());


    assert.ok(position.equals(expected));
});

QUnit.test("Rotation of the facing", function (assert) {

    let boost = new Isometry().set([new THREE.Matrix4().set(
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
    let position = new Position().set(boost, facing);

    let rotation = new THREE.Matrix4().set(
        0, 1, 0, 0,
        -1, 0, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    );

    position.rotateFacingBy(rotation);
    let expected = new Position().set(
        new Isometry().set([new THREE.Matrix4().set(
            1, 0, 0, 2,
            0, 1, 0, 3,
            0, 0, 1, 4,
            0, 0, 0, 1
        )]),
        new THREE.Matrix4()
    );

    assert.ok(position.equals(expected));
});

QUnit.test("Flowing a position", function (assert) {

    let boost = new Isometry().set([new THREE.Matrix4().set(
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
    let position = new Position().set(boost, facing);

    let v = new THREE.Vector3(1, 0, 0);

    let expectedBoost = new Isometry().set([new THREE.Matrix4().set(
        1, 0, 0, 3,
        0, 1, 0, 3,
        0, 0, 1, 4,
        0, 0, 0, 1
    )]);
    let expectedFacing = new THREE.Matrix4().set(
        0, -1, 0, 0,
        1, 0, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    );

    position.flow(v);
    let expected = new Position().set(expectedBoost, expectedFacing);

    assert.ok(position.equals(expected));

});


QUnit.test("Locally flowing a position", function (assert) {

    let boost = new Isometry().set([new THREE.Matrix4().set(
        1, 0, 0, 2,
        0, 1, 0, 3,
        0, 0, 1, 4,
        0, 0, 0, 1
    )]);
    let facing = new THREE.Matrix4();
    let position = new Position().set(boost, facing);

    let v = new THREE.Vector3(1, 0, 0);

    let expectedBoost = new Isometry().set([new THREE.Matrix4().set(
        1, 0, 0, 3,
        0, 1, 0, 3,
        0, 0, 1, 4,
        0, 0, 0, 1
    )]);
    let expectedFacing = new THREE.Matrix4();

    position.localFlow(v);
    console.log(position.boost.matrix.elements);
    let expected = new Position().set(expectedBoost, expectedFacing);

    assert.ok(position.equals(expected));

});

QUnit.test("Rotation of a vector by the facing", function (assert) {

    let boost = new Isometry().set([new THREE.Matrix4().set(
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
    let position = new Position().set(boost, facing);

    let v = new THREE.Vector3(1, 0, 0);

    let computed = position.rotateByFacing(v);
    let expected = new THREE.Vector3(0, 1, 0);

    assert.ok(computed.equals(expected));
});

QUnit.test("Inverse of a position", function (assert) {

    let boost = new Isometry().set([new THREE.Matrix4().set(
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

    let position = new Position().set(boost, facing);

    let invBoost = new Isometry().set([new THREE.Matrix4().set(
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


    let computed = new Position().getInverse(position);
    let expected = new Position().set(invBoost, invFacing);

    assert.ok(computed.equals(expected));
});


QUnit.test("Forward/right/up vector", function (assert) {

    let boost = new Isometry().set([new THREE.Matrix4().set(
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
    let position = new Position().set(boost, facing);

    let computed = position.getFwdVector();
    let expected = new THREE.Vector3(0, 0, -1);
    assert.ok(computed.equals(expected));

    computed = position.getRightVector();
    expected = new THREE.Vector3(1, 0, 0);
    assert.ok(computed.equals(expected));

    computed = position.getUpVector();
    expected = new THREE.Vector3(0, 1, 0);
    assert.ok(computed.equals(expected));

    boost = new Isometry().set([new THREE.Matrix4().set(
        1, 0, 0, 2,
        0, 1, 0, 3,
        0, 0, 1, 4,
        0, 0, 0, 1
    )]);

    facing = new THREE.Matrix4().set(
        0, -1, 0, 0,
        1, 0, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    );
    position = new Position().set(boost, facing);

    computed = position.getFwdVector();
    expected = new THREE.Vector3(0, 0, -1);
    assert.ok(computed.equals(expected));

    computed = position.getRightVector();
    expected = new THREE.Vector3(0, 1, 0);
    assert.ok(computed.equals(expected));

    computed = position.getUpVector();
    expected = new THREE.Vector3(-1, 0, 0);
    assert.ok(computed.equals(expected));
});
