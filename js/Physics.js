function State() {

    // By default the return position is the origin (with the "default" facing - negative z-direction ?)
    this.boost = new Isometry(); //at origin
    this.facing = new THREE.Matrix4(); //identity
    this.velocity = new THREE.Vector3(); //zero velocity
    this.angular = new THREE.Vector3(); //no spin
    this.mass = 1.;


};





State.prototype.setBoost = function (boost) {
    this.boost = boost.clone();
    return this;
};



State.prototype.setFacing = function (facing) {
    this.facing = facing.clone();
    return this;
};


State.prototype.setVelocity = function (velocity) {
    this.velocity = velocity.clone();
    return this;
};

State.prototype.setAngular = function (angular) {
    this.angular = angular.clone();
    return this;
};


State.prototype.setMass = function (mass) {
    this.mass = mass;
    return this;
};

State.prototype.set = function (boost, facing, velocity, angular, mass) {
    this.setBoost(boost);
    this.setFacing(facing);
    this.setVelocity(velocity);
    this.setAngular(angular);
    this.setMass(mass);
    return this;
};


State.prototype.translateBy = function (isom) {
    // translate the position by the given isometry
    this.boost.premultiply(isom);
    this.reduceError();
    //facing unchanged: stored at origin
    //velocity unchanged: stored at origin
    return this;
};

State.prototype.localTranslateBy = function (isom) {
    // if we are at boost of b, our position is b.0. We want to fly forward, and isom
    // tells me how to do this if I were at 0. So I want to apply b * isom * b^{-1} to b * 0, and I get b * isom * 0.
    // In other words, translate boost by the conjugate of isom by boost
    this.boost.multiply(isom);
    this.reduceBoostError();
    //facing unchanged: stored at origin
    //velocity unchanged: stored at origin
    return this;
};

/*
this.rotateFacingBy = function (rotation) {
    // apply the given matrix (on the left) to the current facing and return the new result
    this.facing.premultiply(rotation);
    this.reduceFacingError();
    return this;
};
*/

State.prototype.localRotateFacingBy = function (rotation) {
    // apply the given matrix (on the right) to the current facing and return the new result
    this.facing.multiply(rotation);
    this.reduceFacingError();
    //velocity unchanged by facing rotation
    return this;
};



State.prototype.localFlow = function (t) {
    // move the position following the geodesic flow along the velocity vectory of the state for a time step t.

    // Let gamma be the geodesic starting at p = boost * o directed by boost * v
    // Let gamma_o be the geodesic starting at o directed by v, i.e. gamma_o = boost^{-1} gamma
    // The parallel transport along gamma_o is an operator T_o which we split as T_o = dS_o B_o where
    // - S_o is an isometry of X
    // - B_o an element of SO(3)
    // The position after parallel transport along gamma, is (boost * S_o, B_o * facing)

    // In the Euclidean case, S_o is the regular translation, B_o is the identity.
    let vt = this.velocity.clone().multiplyScalar(t);
    //console.log(new THREE.Vector3(0, 0, -1).multiplyScalar(t));
    let isom = new Isometry().makeLeftTranslation(vt);

    let wHat = this.angular.clone().normalize();
    let wLen = this.angular.clone().length() * t;
    let rotMat = new THREE.Matrix4().makeRotationAxis(wHat, wLen);


    this.boost.multiply(isom);
    this.facing.multiply(rotMat);

    //
    return this
};






State.prototype.getInverse = function (position) {
    // set the current position to the position that can bring back the passed position to the origin position
    this.boost.getInverse(position.boost);
    this.facing.getInverse(position.facing);
    this.reduceError();
    this.velocity.negate();
    this.angular.negate();
    return this;

};

State.prototype.getFwdVector = function () {
    // return the vector moving forward (taking into account the facing)
    return new THREE.Vector3(0, 0, -1).rotateByFacing(this);
};

State.prototype.getRightVector = function () {
    // return the vector moving right (taking into account the facing)
    return new THREE.Vector3(1, 0, 0).rotateByFacing(this);
};

State.prototype.getUpVector = function () {
    // return the vector moving up (taking into account the facing)
    return new THREE.Vector3(0, 1, 0).rotateByFacing(this);
};

State.prototype.reduceBoostError = function () {
    // Nothing to do in Euclidean geometry
    return this;
};

State.prototype.reduceFacingError = function () {
    // Gram-Schmidt
    let col0 = new THREE.Vector4(1, 0, 0, 0).applyMatrix4(this.facing);
    let col1 = new THREE.Vector4(0, 1, 0, 0).applyMatrix4(this.facing);
    let col2 = new THREE.Vector4(0, 0, 1, 0).applyMatrix4(this.facing);

    col0.normalize();

    let aux10 = col0.clone().multiplyScalar(col0.dot(col1));
    col1.sub(aux10).normalize();

    let aux20 = col0.clone().multiplyScalar(col0.dot(col2));
    let aux21 = col1.clone().multiplyScalar(col1.dot(col2));
    col2.sub(aux20).sub(aux21).normalize();

    this.facing.set(
        col0.x, col1.x, col2.x, 0.,
        col0.y, col1.y, col2.y, 0.,
        col0.z, col1.z, col2.z, 0.,
        0., 0., 0., 1.
    );
    return this;
};

State.prototype.reduceError = function () {
    this.reduceBoostError();
    this.reduceFacingError();
    return this;
};

State.prototype.equals = function (position) {
    // test equality of isometries (for debugging purpose mostly)
    return (this.boost.equals(position.boost) && this.facing.equals(position.facing) && this.velocity.equals(position.velocity) && this.angular.equals(position.angular))
};

State.prototype.clone = function () {
    return new State().set(this.boost, this.facing, this.velocity, this.angular, this.mass);
}
//return the position of THIS relative to STATE; ie after translating by the isometry storing the position of STATE
State.prototype.positionRelTo = function (state) {
    let invState = new State().getInverse(state);
    let translation = invState.boost;
    let relativeState = this.clone().translateBy(translation);
    return relativeState;
}


////return the position of STATE relative to THIS; ie after translating by the isometry storing the position of THIS
//State.prototype.positionFrom = function (state) {
//
//    return state.positionRelto(this);
//}

//returns the tangent vector (based at origin) which is the translate of the based tangent vector (at THIS.Position) pointing to state.position
State.prototype.tangDirectionTo = function (state) {
    //move THIS to origin
    //this is the relative position of STATE with THIS at ORIGIN
    let relState = state.clone().positionRelTo(this);
    //get the actual point ascociated to this state
    let relPosition = relState.positionPoint();
    //get the tangent vector based at the origin to the point P in the model space
    let tv = tangDirection(relPosition);
    return tv;
}

//returns the position of the point stored by state
//really, should be doing this to position and using it here
State.prototype.positionPoint = function () {
    return ORIGIN.clone().applyMatrix4(this.boost.matrix.clone());
}

//returns the distance from THIS to STATE
State.prototype.distanceTo = function (state) {
    //translate THIS relative to state
    let relativePos = this.clone().positionRelTo(state);
    let position = relativePos.positionPoint();
    //find distance of position from origin
    return geomDistance(position);
}

//flow a state along the geodesic flow given by w (direction is dir of w, distance is length of w)
State.prototype.flowBy = function (w) {

    let isom = new Isometry().translateByVector(w);

    this.boost.multiply(isom);
    return this;
    //DO EXPLICIT PARALLEL TRANSPORT IN GENERAL (NIL....)
    //
}
