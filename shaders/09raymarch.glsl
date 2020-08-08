// Check if the given point p is in the fundamental domain of the lattice.
// Lattice = SL(2,Z)
bool isOutsideCellModular(Point p, out Isometry fixIsom){
    // point in the Klein model
    // (where the fundamental domain is convex polyhedron).
    vec4 klein = toKlein(p);

    // Normal defining the fundamental domain of SL(2,Z)
    vec4 n0 = vec4(0, -1, 0, 0);
    vec4 n2 = vec4(2, 1, 0, 0);
    vec4 n3 = vec4(-2, 1, 0, 0);
    vec4 n4 = vec4(0, 0, 0, 1);


    // lift of the rotation of angle pi around the origin
    Isometry gen0 = Isometry(Point(
    vec4(0, -1, 0, 0),
    - PI
    ));
    // lift the the parabolic z -> z - 1 (in the upper half plane model)
    Isometry gen2 = Isometry(Point(
    vec4(1, -0.5, -0.5, 0),
    -2. * atan(0.5)
    ));
    // lift the the parabolic z -> z + 1 (in the upper half plane model)
    // inverse of the previous one
    Isometry gen3 = Isometry(Point(
    vec4(1, 0.5, 0.5, 0),
    2. * atan(0.5)
    ));
    // translation by -4pi along the fiber
    Isometry gen4 = Isometry(Point(
    vec4(1, 0, 0, 0),
    -4. * PI
    ));
    // translation by 4pi along the fiber
    Isometry gen5 = Isometry(Point(
    vec4(1, 0, 0, 0),
    4. * PI
    ));

    // testing if the point is in the fundamental domain, and the matrix to fix it

    if (dot(klein, n0) > 0.) {
        fixIsom = gen0;
        return true;
    }
    if (dot(klein, n2) > 1.) {
        fixIsom = gen2;
        return true;
    }
    if (dot(klein, n3) > 1.) {
        fixIsom = gen3;
        return true;
    }
    if (dot(klein, n4) > 2. * PI) {
        fixIsom = gen4;
        //debugColor = vec3(1,0,0);
        return true;
    }
    if (dot(klein, n4) < -2. * PI) {
        fixIsom = gen5;
        //debugColor = vec3(0,1,0);
        return true;
    }
    return false;
}


// Check if the given point p is in the fundamental domain of the lattice.
// Lattice : quadrangle
bool isOutsideCellSquare(Point p, out Isometry fixIsom){
    // point in the Klein model
    // (where the fundamental domain is convex polyhedron).
    vec4 klein = toKlein(p);

    // Normal defining the fundamental domain of the lattice
    vec4 np = vec4(1, 1, 0, 0);
    vec4 nm = vec4(-1, 1, 0, 0);
    vec4 nfiber = vec4(0, 0, 0, 1);

    // lift of the first rotation
    Isometry gen1 = Isometry(Point(
    vec4(sqrt3 / 2., sqrt3 / 2., sqrt2 / 2., 0),
    PI / 2.
    ));

    Isometry gen1inv = Isometry(Point(
    vec4(sqrt3 / 2., -sqrt3 / 2., -sqrt2 / 2., 0),
    -PI / 2.
    ));

    // lift of the second rotation
    Isometry gen2 = Isometry(Point(
    vec4(sqrt3 / 2., sqrt3 / 2., - sqrt2 / 2., 0),
    PI / 2.
    ));

    Isometry gen2inv = Isometry(Point(
    vec4(sqrt3 / 2., -sqrt3 / 2., sqrt2 / 2., 0),
    -PI / 2.
    ));

    // translation by 2pi along the fiber
    Isometry gen3 = Isometry(Point(
    vec4(-1, 0, 0, 0),
    2. * PI
    ));

    // translation by -2pi along the fiber
    Isometry gen3inv = Isometry(Point(
    vec4(-1, 0, 0, 0),
    - 2. * PI
    ));


    // testing if the point is in the fundamental domain, and the matrix to fix it

    float threshold = sqrt2 / sqrt3;

    if (dot(klein, nm) > threshold) {
        fixIsom = gen1;
        return true;
    }
    if (dot(klein, np) > threshold) {
        fixIsom = gen1inv;
        return true;
    }
    if (dot(klein, nm) < -threshold) {
        fixIsom = gen2;
        return true;
    }
    if (dot(klein, np) < -threshold) {
        fixIsom = gen2inv;
        return true;
    }
    if (dot(klein, nfiber) > PI) {
        fixIsom = gen3inv;
        return true;
    }
    if (dot(klein, nfiber) < -PI) {
        fixIsom = gen3;
        return true;
    }

    return false;
}

// Check if the given point p is in the fundamental domain of the discrete subgroup.
// Subgroup: translation along the fiber by a fixed angle
bool isOutsideCellFiber(Point p, out Isometry fixIsom){
    // no need here to consider the Klein model
    // everything takes place in the fiber coordinate

    // translation by pi/2 along the fiber
    Isometry gen = Isometry(Point(
    vec4(0.5 * sqrt3, 0.5, 0, 0),
    PI / 3.
    ));

    // translation by pi/2 along the fiber
    Isometry genInv = Isometry(Point(
    vec4(0.5 * sqrt3, -0.5, 0, 0),
    - PI / 3.
    ));

    if (p.fiber > PI / 6.) {
        fixIsom = genInv;
        return true;
    }
    if (p.fiber < - PI / 6.) {
        fixIsom = gen;
        return true;
    }
    return false;
}


/****************************************************

LATTICE CORRESPONDING TO A GENUS 2 SURFACE

*****************************************************/


// Check if the given point p is in the fundamental domain of the lattice.
// Lattice : surface of genus 2
bool isOutsideCellSurface(Point p, out Isometry fixIsom){
    // point in the Klein model
    // (where the fundamental domain is convex polyhedron).
    vec4 klein = toKlein(p);

    // Normal defining the fundamental domain of the lattice
    vec4 nh = vec4(1, 0, 0, 0);
    vec4 nv = vec4(0, 1, 0, 0);
    vec4 nd1 = vec4(0.5 * sqrt2, 0.5 * sqrt2, 0, 0);
    vec4 nd2 = vec4(-0.5 * sqrt2, 0.5 * sqrt2, 0, 0);
    vec4 nfiber = vec4(0, 0, 0, 1);


    float auxSurfaceP = sqrt(sqrt2 + 1.);
    float auxSurfaceM = sqrt(sqrt2 - 1.);

    // lifts of the 4 translations (and their inverses)
    Isometry genA1 = Isometry(Point(
    vec4(0.5 * sqrt2 + 1., 0.5 * sqrt2 + 1., auxSurfaceP, -auxSurfaceP),
    PI / 2.
    ));

    Isometry genA1inv = Isometry(Point(
    vec4(0.5 * sqrt2 + 1., -0.5 * sqrt2 - 1., -auxSurfaceP, auxSurfaceP),
    -PI / 2.
    ));

    Isometry genA2 = Isometry(Point(
    vec4(0.5 * sqrt2 + 1., 0.5 * sqrt2 + 1., -auxSurfaceP, auxSurfaceP),
    PI / 2.
    ));

    Isometry genA2inv = Isometry(Point(
    vec4(0.5 * sqrt2 + 1., -0.5 * sqrt2 - 1., auxSurfaceP, -auxSurfaceP),
    -PI / 2.
    ));

    Isometry genB1 = Isometry(Point(
    vec4(0.5 * sqrt2 + 1., 0.5 * sqrt2 + 1., sqrt2 * auxSurfaceP, 0),
    PI / 2.
    ));

    Isometry genB1inv = Isometry(Point(
    vec4(0.5 * sqrt2 + 1., -0.5 * sqrt2 - 1., -sqrt2 * auxSurfaceP, 0),
    -PI / 2.
    ));

    Isometry genB2 = Isometry(Point(
    vec4(0.5 * sqrt2 + 1., 0.5 * sqrt2 + 1., -sqrt2 * auxSurfaceP, 0),
    PI / 2.
    ));

    Isometry genB2inv = Isometry(Point(
    vec4(0.5 * sqrt2 + 1., -0.5 * sqrt2 - 1., sqrt2 * auxSurfaceP, 0),
    -PI / 2.
    ));

    // translation by 2pi along the fiber
    Isometry genC = Isometry(Point(
    vec4(-1, 0, 0, 0),
    2. * PI
    ));

    // translation by -2pi along the fiber
    Isometry genCinv = Isometry(Point(
    vec4(-1, 0, 0, 0),
    - 2. * PI
    ));

    // testing if the point is in the fundamental domain, and the matrix to fix it
    float threshold = sqrt2 * auxSurfaceM;


    if (dot(klein, nh) > threshold) {
        fixIsom = genA1inv;
        return true;
    }
    if (dot(klein, nd1) > threshold) {
        fixIsom = genB1inv;
        return true;
    }
    if (dot(klein, nv) > threshold) {
        fixIsom = genA1;
        return true;
    }
    if (dot(klein, nd2) > threshold) {
        fixIsom = genB1;
        return true;
    }
    if (dot(klein, nh) < -threshold) {
        fixIsom = genA2inv;
        return true;
    }
    if (dot(klein, nd1) < -threshold) {
        fixIsom = genB2inv;
        return true;
    }
    if (dot(klein, nv) < -threshold) {
        fixIsom = genA2;
        return true;
    }
    if (dot(klein, nd2) < -threshold) {
        fixIsom = genB2;
        return true;
    }
    if (dot(klein, nfiber) > PI) {
        fixIsom = genCinv;
        return true;
    }
    if (dot(klein, nfiber) < -PI) {
        fixIsom = genC;
        return true;
    }

    return false;
}




bool isOutsideCell(Point p, out Isometry fixIsom){
    //return isOutsideCellModular(p, fixIsom);
    return isOutsideCellSquare(p, fixIsom);
    //return isOutsideCellFiber(p, fixIsom);
   // return isOutsideCellSurface(p, fixIsom);
}

// overload of the previous method with tangent vector
bool isOutsideCell(Vector v, out Isometry fixIsom){
    return isOutsideCell(v.pos, fixIsom);
}




















//----------------------------------------------------------------------------------------------------------------------
// DOING THE RAYMARCH
//----------------------------------------------------------------------------------------------------------------------


// raymarch algorithm
// each step is the march is made from the previously achieved position (useful later for Sol).
// done with general vectors


int BINARY_SEARCH_STEPS=10;

void raymarchIterate(Vector rayDir, out Isometry totalFixIsom){

    Isometry fixIsom;
    Isometry testfixIsom;
    float marchStep = MIN_DIST;
    float testMarchStep = MIN_DIST;
    float globalDepth = MIN_DIST;
    float localDepth = MIN_DIST;
    Vector tv = rayDir;
    Vector localtv = rayDir;
    Vector testlocaltv = rayDir;
    Vector bestlocaltv = rayDir;
    totalFixIsom = identity;

    // Trace the local scene, then the global scene:

    if (TILING_SCENE){
        for (int i = 0; i < MAX_MARCHING_STEPS; i++){
            localtv = flow(localtv, marchStep);
            if (isOutsideCell(localtv, fixIsom)){
                totalFixIsom = composeIsometry(fixIsom, totalFixIsom);
                localtv = translate(fixIsom, localtv);
                marchStep = MIN_DIST;
            }
            else {
                float localDist = min(1., localSceneSDF(localtv.pos));
                if (localDist < EPSILON){
                    sampletv = localtv;
                    break;
                }
                marchStep = localDist;
                globalDepth += localDist;
            }
        }

        localDepth=min(globalDepth, MAX_DIST);

        /*
        // TODO. VERSION TO BE CHECKED...
        for (int i = 0; i < MAX_MARCHING_STEPS; i++){
            float localDist = localSceneSDF(localtv.pos);


            if (localDist < EPSILON){
                sampletv = toTangVector(localtv);
                break;
            }
            marchStep = localDist;

            //localtv = flow(localtv, marchStep);

            //            if (isOutsideCell(localtv, fixIsom)){
            //                totalFixIsom = composeIsometry(fixIsom, totalFixIsom);
            //                localtv = translate(fixIsom, localtv);
            //                localtv=tangNormalize(localtv);
            //                marchStep = MIN_DIST;
            //            }

            testlocaltv = flow(localtv, marchStep);
            if (isOutsideCell(testlocaltv, fixIsom)){
                bestlocaltv = testlocaltv;

                for (int j = 0; j < BINARY_SEARCH_STEPS; j++){
                    ////// do binary search to get close to but outside this cell -
                    ////// dont jump too far forwards, since localSDF can't see stuff in the next cube
                    testMarchStep = marchStep - pow(0.5,float(j+1))*localDist;
                    testlocaltv = flow(localtv, testMarchStep);
                    if ( isOutsideCell(testlocaltv, testfixIsom) ){
                        marchStep = testMarchStep;
                        bestlocaltv = testlocaltv;
                        fixIsom = testfixIsom;
                    }
                }

                localtv = bestlocaltv;
                totalFixIsom = composeIsometry(fixIsom, totalFixIsom);
                localtv = translate(fixIsom, localtv);
                localtv=tangNormalize(localtv);
                //globalDepth += marchStep;
                marchStep = MIN_DIST;
            }

            else{
                localtv = testlocaltv;
                globalDepth += marchStep;
            }
        }
        localDepth=min(globalDepth, MAX_DIST);
        */

    }
    else {
        localDepth=MAX_DIST;
    }

    if (GLOBAL_SCENE){
        globalDepth = MIN_DIST;
        marchStep = MIN_DIST;

        for (int i = 0; i < MAX_MARCHING_STEPS; i++){
            tv = flow(tv, marchStep);

            /*
            if (i == 1) {
                float aux = globalSceneSDF(tv.pos);
                hitWhich = 5;
                //debugColor = 1000. * aux * vec3(1, 0, 0);
                debugColor = abs(tv.dir);
                break;
            }
            */

            float globalDist = globalSceneSDF(tv.pos);
            if (globalDist < EPSILON){
                // hitWhich has now been set
                totalFixIsom = identity;
                sampletv = tv;
                return;
            }
            marchStep = globalDist;
            globalDepth += globalDist;
            if (globalDepth >= localDepth){
                break;
            }
        }
    }
}


void raymarchDirect(Vector rayDir, out Isometry totalFixIsom){

    Isometry fixIsom;
    Isometry testFixIsom;
    float marchStep = MIN_DIST;
    float testMarchStep = MIN_DIST;
    float globalDepth = MIN_DIST;
    float localDepth = MIN_DIST;
    Vector tv = rayDir;
    Vector localtv = rayDir;
    Vector testlocaltv = rayDir;
    Vector bestlocaltv = rayDir;
    totalFixIsom = identity;

    // Trace the local scene, then the global scene:

    if (TILING_SCENE){
        /*
        // VERSION WITHOUT CREEPING
        for (int i = 0; i < MAX_MARCHING_STEPS; i++){
            localtv = flow(localtv, marchStep);
            if (isOutsideCell(localtv, fixIsom)){
                totalFixIsom = composeIsometry(fixIsom, totalFixIsom);
                localtv = translate(fixIsom, localtv);
                marchStep = MIN_DIST;
            }
            else {
                float localDist = min(1., localSceneSDF(localtv.pos));
                if (localDist < EPSILON){
                    sampletv = localtv;
                    break;
                }
                marchStep = localDist;
                globalDepth += localDist;
            }
        }

        localDepth=min(globalDepth, MAX_DIST);
        */

        // VERSION WITH CREEPING
        for (int i = 0; i < MAX_MARCHING_STEPS; i++){
            float localDist = localSceneSDF(localtv.pos);
            if (localDist < EPSILON){
                sampletv = localtv;
                //distToViewer=localDepth;
                break;
            }
            marchStep = localDist;

            testlocaltv = flow(localtv, marchStep);
            if (isOutsideCell(testlocaltv, fixIsom)){
                bestlocaltv = testlocaltv;

                //commenting out this for loop brings us back to what we were doing before...
                for (int j = 0; j < BINARY_SEARCH_STEPS; j++){
                    // do binary search to get close to but outside this cell -
                    // dont jump too far forwards, since localSDF can't see stuff in the next cube
                    testMarchStep = marchStep - pow(0.5, float(j+1))*localDist;
                    testlocaltv = flow(localtv, testMarchStep);
                    if (isOutsideCell(testlocaltv, testFixIsom)){
                        marchStep = testMarchStep;
                        bestlocaltv = testlocaltv;
                        fixIsom = testFixIsom;
                    }
                }
                localtv = bestlocaltv;
                totalFixIsom = composeIsometry(fixIsom, totalFixIsom);
                localtv = translate(fixIsom, localtv);
                localDepth += marchStep;
                marchStep = MIN_DIST;
            }

            else {
                localtv = testlocaltv;
                localDepth += marchStep;
            }
        }

        localDepth=min(localDepth, MAX_DIST);


    }
    else {
        localDepth=MAX_DIST;
    }

    if (GLOBAL_SCENE){
        globalDepth = MIN_DIST;
        marchStep = MIN_DIST;

        for (int i = 0; i < MAX_MARCHING_STEPS; i++){
            tv = flow(rayDir, globalDepth);

            /*
            if (i == 2) {
                //float aux = globalSceneSDF(tv.pos);
                hitWhich = 5;
                //debugColor = 1000. * aux * vec3(1, 0, 0);
                debugColor = vec3(tv.pos.fiber, -tv.pos.fiber,0);
                break;
            }
            */


            float globalDist = globalSceneSDF(tv.pos);
            if (globalDist < EPSILON){
                // hitWhich has now been set
                //hitWhich = 5;
                //debugColor = abs(tv.dir);
                totalFixIsom = identity;
                sampletv = tv;
                return;
            }
            //marchStep = globalDist;
            globalDepth += globalDist;
            if (globalDepth >= localDepth){
                //hitWhich = 5;
                //debugColor = vec3(1, 1, 0);
                break;
            }
        }
    }
}


void raymarch(Vector rayDir, out Isometry totalFixIsom){
    //raymarchIterate(rayDir, totalFixIsom);
    raymarchDirect(rayDir, totalFixIsom);
}



















