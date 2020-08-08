//----------------------------------------------------------------------------------------------------------------------
// Tangent Space Functions
//----------------------------------------------------------------------------------------------------------------------

Vector getRayPoint(vec2 resolution, vec2 fragCoord, bool isLeft){ //creates a tangent vector for our ray
    if (isStereo == 1){
        resolution.x = resolution.x * 0.5;
        if (!isLeft) { fragCoord.x = fragCoord.x - resolution.x; }
    }
    vec2 xy = 0.2 * ((fragCoord - 0.5*resolution)/resolution.x);
    float z = 0.1 / tan(radians(fov * 0.5));
    // coordinates in the prefered frame at the origin
    vec3 dir = vec3(xy, -z);
    Vector tv = createVector(ORIGIN, dir);
    tv = tangNormalize(tv);
    return tv;
}

//----------------------------------------------------------------------------------------------------------------------
// Main
//----------------------------------------------------------------------------------------------------------------------


void main(){
    setResolution(resol);
    currentBoost = unserializeIsom(currentBoostMat);
    leftBoost = unserializeIsom(leftBoostMat);
    rightBoost = unserializeIsom(rightBoostMat);
    cellBoost = unserializeIsom(cellBoostMat);
    invCellBoost = unserializeIsom(invCellBoostMat);
    globalObjectBoost = unserializeIsom(globalObjectBoostMat);

    localLightPos = fromVec4(vec4(0.1, 0.1, -0.2, 1.));


    //stereo translations ----------------------------------------------------
    bool isLeft = gl_FragCoord.x/screenResolution.x <= 0.5;
    Vector rayDir = getRayPoint(screenResolution, gl_FragCoord.xy, isLeft);



    if (isStereo == 1){
        if (isLeft){
            rayDir = rotateByFacing(leftFacing, rayDir);
            rayDir = translate(leftBoost, rayDir);
        }
        else {
            rayDir = rotateByFacing(rightFacing, rayDir);
            rayDir = translate(rightBoost, rayDir);
        }
    }
    else {
        //debugColor = vec3(0, 1, 1);
        rayDir = rotateByFacing(facing, rayDir);
        rayDir = translate(currentBoost, rayDir);
    }

    /*
    Point p = fromVec4(vec4(0, 0, 1, -1));
    //float d = 0.5 * fakeDist(rayDir.pos, p);
    float d = 0.5 * exactDist(rayDir.pos, p);
    out_FragColor = vec4(debugColor, 1);
    */

    Isometry totalFixIsom = identity;

    //do the marching
    raymarch(rayDir, totalFixIsom);


    vec3 pixelColor;
    //Based on hitWhich decide whether we hit a global object, local object, or nothing
    switch (hitWhich){
        case 0://Didn't hit anything
        //COLOR THE FRAME DARK GRAY
        //0.2 is medium gray, 0 is black
        out_FragColor = vec4(0.4);
        break;

        case 1:// global lights
        pixelColor= lightColor(totalFixIsom, sampletv, colorOfLight);
        //out_FragColor=vec4(pixelColor, 1.0);
        out_FragColor = vec4(colorOfLight, 1.0);
        break;

        case 2:// global object
        pixelColor= ballColor(totalFixIsom, sampletv);
        //debugColor = abs(N.dir);
        //pixelColor = debugColor;
        out_FragColor=vec4(pixelColor, 1.0);
        break;

        case 3:// local objects
        pixelColor= tilingColor(totalFixIsom, sampletv);
        out_FragColor=vec4(pixelColor, 1.0);
        break;

        case 5:
        //debug
        out_FragColor = vec4(debugColor, 1.0);
        break;
    }


}