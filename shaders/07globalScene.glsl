//GLOBAL OBJECTS SCENE ++++++++++++++++++++++++++++++++++++++++++++++++
// Global signed distance function : distance from cellBoost * p to an object in the global scene
float globalSceneSDF(Point p){
//    // correct for the fact that we have been moving
   Point absolutep = translate(cellBoost, p);
   float distance;

  distance = sphereSDF(absolutep, ORIGIN, 0.3);

    if (distance < EPSILON){
        hitWhich = 2;
        return distance;
    }

   return distance;

}

