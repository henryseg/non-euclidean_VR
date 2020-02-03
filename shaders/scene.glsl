//----------------------------------------------------------------------------------------------------------------------
// Raymarch Primitives
//----------------------------------------------------------------------------------------------------------------------


float sphereSDF(vec4 p, vec4 center, float radius){
    return exactDist(p, center) - radius;
}


float ellipsoidSDF(vec4 p, vec4 center, float radius){
    return exactDist(vec4(p.x, p.y, p.z/2., 1.), center) - radius;
}

float fatEllipsoidSDF(vec4 p, vec4 center, float radius){
    return exactDist(vec4(p.x/10., p.y/10., p.z, 1.), center) - radius;
}

float centerSDF(vec4 p, vec4 center, float radius){
    return sphereSDF(p, center, radius);
}


float vertexSDF(vec4 p, vec4 cornerPoint, float size){
    return sphereSDF(abs(p), cornerPoint, size);
}

float horizontalHalfSpaceSDF(vec4 p, float h) {
    //signed distance function to the half space z < h
    return p.z - h;
}


float sliceSDF(vec4 p) {
    float HS1= 0.;
    HS1=horizontalHalfSpaceSDF(p, -0.1);
    float HS2=0.;
    HS2=-horizontalHalfSpaceSDF(p, -1.);
    return max(HS1, HS2);
}

float cylSDF(vec4 p, float r){
    return sphereSDF(vec4(p.x, p.y, 0., 1.), ORIGIN, r);
}

//----------------------------------------------------------------------------------------------------------------------
// Global Variables
//----------------------------------------------------------------------------------------------------------------------
tangVector N;//normal vector
tangVector sampletv;
vec4 globalLightColor;
Isometry identityIsometry=Isometry(mat4(1.0));

Isometry currentBoost;
Isometry leftBoost;
Isometry rightBoost;
Isometry cellBoost;
Isometry invCellBoost;
Isometry globalObjectBoost;


//----------------------------------------------------------------------------------------------------------------------
// Re-packaging isometries, facings in the shader
//----------------------------------------------------------------------------------------------------------------------

//This actually occurs at the beginning of main() as it needs to be inside of a function


//----------------------------------------------------------------------------------------------------------------------
// Scene Definitions
//----------------------------------------------------------------------------------------------------------------------
// Turn off the local scene
// Local signed distance function : distance from p to an object in the local scene

float localSceneSDF(vec4 p){
    float tilingDist;
    float dragonDist;
    float planesDist;
    float lightDist;
    float distance = MAX_DIST;

    lightDist=sphereSDF(p, localLightPos, lightRad);
    distance=min(distance, lightDist);
    if (lightDist < EPSILON){
        //LIGHT=true;
        hitWhich = 1;
        colorOfLight=vec3(1., 1., 1.);
        return lightDist;
    }

    if (display==3){ //dragon
        vec4 center = vec4(0., 0., 0., 1.);;
        float dragonDist = fatEllipsoidSDF(p, center, 0.03);
        distance = min(distance, dragonDist);
        if (dragonDist<EPSILON){
            //LIGHT=false;
            hitWhich=3;
            return dragonDist;
        }

    }

    if (display==4){ //dragon tiling
        vec4 center = vec4(0., 0., 0., 1.);
        float dragonDist = ellipsoidSDF(p, center, 0.2);
        //float dragonDist = fatEllipsoidSDF(p, center, 0.03);
        distance = min(distance, dragonDist);
        if (dragonDist<EPSILON){
            //LIGHT=false;
            hitWhich=3;
            return dragonDist;
        }

    }

    if (display==1){ //tiling
        vec4 center = vec4(0., 0., 0., 1.);
        float sphere=0.;
        sphere = ellipsoidSDF(p, center, 0.35);
        tilingDist=-sphere;


        //cut out a vertical cylinder to poke holes in the top, bottom
        //    float cyl=0.0;
        //    cyl=cylSDF(p,0.2);
        //    tilingDist= -min(sphere, cyl);
        //

        //instead, cut out two balls from the top, bottom
        //right now not working well because of the sphere distance function
        //    float topSph=0.0;
        //    float bottomSph=0.0;
        //    float spheres=0.;
        //    topSph=sphereSDF(p, vec4(0.,0.,z0,1.),0.7);
        //    bottomSph=sphereSDF(p, vec4(0.,0.,-z0,1.),0.7);
        //    spheres=min(topSph,bottomSph);
        //    tilingDist=-min(sphere,spheres);

        distance=min(distance, tilingDist);

        if (tilingDist < EPSILON){
            // LIGHT=false;
            hitWhich=3;
            return tilingDist;
        }
    }

    if (display==2){ //planes
        vec4 center = vec4(0., 0., 0., 1.);
        float sphere=0.;
        sphere = sphereSDF(p, center, 0.5);

        planesDist = -sphere;
        distance=min(distance, planesDist);
        if (planesDist < EPSILON){

            hitWhich=3;
            return planesDist;
        }
    }
    return distance;
}

//GLOBAL OBJECTS SCENE ++++++++++++++++++++++++++++++++++++++++++++++++
// Global signed distance function : distance from cellBoost * p to an object in the global scene
float globalSceneSDF(vec4 p){
    // correct for the fact that we have been moving
    vec4 absolutep = translate(cellBoost, p);
    float distance = MAX_DIST;
    //Light Objects
    for (int i=0; i<4; i++){
        float objDist;
        objDist = sphereSDF(
        absolutep,
        lightPositions[i],
        0.1
        //    1.0/(10.0*lightIntensities[i].w)
        );
        distance = min(distance, objDist);
        if (distance < EPSILON){
            hitWhich = 1;
            globalLightColor = lightIntensities[i];
            return distance;
        }
    }
    //Global Sphere Object

    float objDist = sliceSDF(absolutep);
    //float slabDist;
    //float sphDist;
    //slabDist = sliceSDF(absolutep);
    //sphDist=sphereSDF(absolutep,vec4(0.,0.,-0.2,1.),0.5);
    //objDist=max(slabDist,-sphDist);
    // objDist=MAX_DIST;


    //global plane


    //    vec4 globalObjPos=translate(globalObjectBoost, ORIGIN);
    //    //objDist = sphereSDF(absolutep, vec4(sqrt(6.26), sqrt(6.28), 0., 1.), globalSphereRad);
    //    objDist = sphereSDF(absolutep, globalObjPos, 0.1);
    //
    //
    //
    //    distance = min(distance, objDist);
    //    if (distance < EPSILON){
    //        hitWhich = 2;
    //    }


    return distance;
    // return MAX_DIST;
}
