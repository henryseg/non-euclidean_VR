//GLOBAL OBJECTS SCENE ++++++++++++++++++++++++++++++++++++++++++++++++
// Global signed distance function : distance from cellBoost * p to an object in the global scene
float globalSceneSDF(Point p){
    // correct for the fact that we have been moving
    Point absolutep = translate(cellBoost, p);
    float distance = MAX_DIST;
    float objDist;

    //Light Objects
    for (int i=0; i<4; i++){
        objDist = sphereSDF(absolutep, unserializePoint(lightPositions[i]), 0.1);
        distance = min(distance, objDist);
        if (distance < EPSILON){
            hitWhich = 1;
            colorOfLight = lightIntensities[i].xyz;
            globalLightColor = lightIntensities[i];
            return distance;
        }
    }


    //Global Sphere Object
    Point globalObjPos1 = translate(globalObjectBoost, ORIGIN);
    objDist = sphereSDF(absolutep, globalObjPos1, 0.3);

    distance = min(distance, objDist);
    if (distance < EPSILON){
        hitWhich = 2;
        return distance;
    }


    return distance;
}

