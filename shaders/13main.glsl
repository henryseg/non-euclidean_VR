//----------------------------------------------------------------------------------------------------------------------
// Tangent Space Functions
//----------------------------------------------------------------------------------------------------------------------

tangVector getRayPoint(vec2 resolution, vec2 fragCoord, bool isLeft){ //creates a tangent vector for our ray
    if (isStereo == 1){
        resolution.x = resolution.x * 0.5;
        if (!isLeft) { fragCoord.x = fragCoord.x - resolution.x; }
    }
    vec2 xy = 0.2*((fragCoord - 0.5*resolution)/resolution.x);
    float z = 0.1/tan(radians(fov*0.5));
    tangVector tv = tangVector(ORIGIN, vec4(xy, -z, 0.0));
    tangVector v =  tangNormalize(tv);
    return v;
}







    //stereo translations ----------------------------------------------------
tangVector setRayDir(){
    bool isLeft = gl_FragCoord.x/screenResolution.x <= 0.5;
    tangVector rD = getRayPoint(screenResolution, gl_FragCoord.xy, isLeft);

    if (isStereo == 1){
        if (isLeft){
            rD = rotateFacing(leftFacing, rD);
            rD = translate(leftBoost, rD);
        }
        else {
            rD = rotateFacing(rightFacing, rD);
            rD = translate(rightBoost, rD);
        }
    }
    else {
        rD = rotateFacing(facing, rD);
        rD = translate(currentBoost, rD);
    }
    return rD;
}
    
    








//----------------------------------------------------------------------------------------------------------------------
// Main
//----------------------------------------------------------------------------------------------------------------------

void main(){
    
    vec4 pixelColor;
    
    //in setup
    setResolution(res);
    setVariables();

    //in raymarch
    tangVector rayDir=setRayDir();
    
    if(quality==2){
     pixelColor=vec4(cheapPixelColor(rayDir),1.);
    }
    else{
        pixelColor=vec4(doubleBouncePixelColor(rayDir),1.);
    }
    
    //gamma correction from shadertoy
    out_FragColor= vec4(pow(clamp(pixelColor, 0., 1.),vec4(0.8)));
    

    
    }