void main() {

  if(abs(gl_FragCoord.x)<10.) {
    gl_FragColor = vec4(1,0,0,1);
  }
  else{
    gl_FragColor = vec4(0,1,0,1);
  }

}
