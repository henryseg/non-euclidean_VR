//----------------------------------------------------------------------------------------------------------------------
// Main
//----------------------------------------------------------------------------------------------------------------------

void main(){
    
    //in setup
    setResolution(res);
    setVariables();

    //in raymarch
    tangVector rayDir=setRayDir();
    
    
    // ------------------------
    Isometry totalFixMatrix = identityIsometry;
  
    //do the  raymarch    
    raymarch(toLocalTangVector(rayDir), totalFixMatrix);
    
    //figuring out the color of the point we marched to
    vec4 resultingColor;
    resultingColor=marchedColor(hitWhich,totalFixMatrix,sampletv);
    
    //if we stop with no reflections: output this color
    //out_FragColor=resultingColor;
    

    
    //TRY REFLECTIONS!! ------------------------
    
    //have a uniform float mirror that says how shiny the surface is:
     
    if(mirror==0.||hitWhich==1){//don't do a second round
        
        out_FragColor=resultingColor;
        
        //attempt at  "Gamma correction" from shadertoy should take sqrt of the entries in  that case but left it out for now...
        out_FragColor=vec4(sqrt(clamp(resultingColor, 0., 1.)));
        return;
    }
    
    //
    
    
    
    
    //---------DOING ONE REFLECTION ----------------------
    
    
    
    
    else{
    
    //do the raymarch again! starting from this position (sampletv)
    //first, reflect this direction wtih respect to the surface normal
    tangVector nVec=estimateNormal(sampletv.pos);
    tangVector newDir = sub(scalarMult(-2.0 * cosAng(sampletv, nVec), nVec), sampletv);
    
    
    
    //randomly adjust the direction by a TINY ammount to simulate slight  roughness in the surface
//    float n = sin(dot(newDir.pos, vec4(27, 113, 57,0.)));
//    vec4 rnd = fract(vec4(2097152, 262144, 32768,0.)*n)*.16 - .08;
//    newDir.dir=newDir.dir+0.05*rnd;
    
    //move the new ray off a little bit
    newDir.pos=newDir.pos+0.01*newDir.dir;
    //then, raymarch in this new direction
    reflectmarch(toLocalTangVector(newDir), totalFixMatrix);
    
    //now, get the reflected color
    vec4 reflectedColor;
    reflectedColor=marchedColor(hitWhich,totalFixMatrix,sampletv);
    
        
     //if the reflectivity of the surface is below 50% say, just output the color
    if(mirror<0.75){
    //now combine the first pass color and the  reflected color to output
    
        
       resultingColor= 0.2*resultingColor+0.8*((1.-mirror)*resultingColor+mirror* reflectedColor);
        
              //  out_FragColor=resultingColor;
        
        
        //this is some sort of "Gamma correction" from shadertoy 
            out_FragColor=vec4(pow(clamp(resultingColor, 0., 1.),vec4(0.6)));
        return;
        

    }
        
        
        
        
        
        
        
        //---------DOING TWO REFLECTIONS 
        
        else if(mirror>0.75){// we do a second reflection! So the reflections have reflections
            
     //do the raymarch again! starting from this position (sampletv)
    //first, reflect this direction wtih respect to the surface normal
    nVec=estimateNormal(sampletv.pos);
    newDir = sub(scalarMult(-2.0 * cosAng(sampletv, nVec), nVec), sampletv);
    
    //move the new ray off a little bit
    newDir.pos=newDir.pos+0.01*newDir.dir;
    //then, raymarch in this new direction
    reflectmarch(toLocalTangVector(newDir), totalFixMatrix);
    
    //now, get the reflected color
    vec4 reflectedColor2;
    reflectedColor2=marchedColor(hitWhich,totalFixMatrix,sampletv);
    
    //now combine the first pass color and the  reflected color to output
    out_FragColor=((1.1-mirror)*resultingColor+mirror*((1.-mirror)*reflectedColor+mirror/5.*reflectedColor2));
   
            
            
            
        }
    
    }
    
    
    
    
    
//    //Run Reflections a Third Time!! ------------------------
//    
//    //do the raymarch again! starting from this position (sampletv)
//    //first, reflect this direction wtih respect to the surface normal
//    nVec=estimateNormal(sampletv.pos);
//    newDir = sub(scalarMult(-2.0 * cosAng(sampletv, nVec), nVec), sampletv);
//    
//    //move the new ray off a little bit
//    newDir.pos=newDir.pos+0.01*newDir.dir;
//    //then, raymarch in this new direction
//    raymarch(toLocalTangVector(newDir), totalFixMatrix);
//    
//    //now, get the reflected color
//    vec4 reflectedColor2;
//    reflectedColor2=marchedColor(hitWhich,totalFixMatrix,sampletv);
//    
//    //now combine the first pass color and the  reflected color to output
//    out_FragColor=resultingColor+0.25*reflectedColor+0.1*reflectedColor2;



}