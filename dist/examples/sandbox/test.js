const regexp = /bool\s*(\w+)\(Point.*\)/m;


const cubeHalfWidth = 0.8;
const test = `//
bool testYp(Point p){
    return p.coords.y > ${cubeHalfWidth};
} 
`;

console.log(test.match(regexp));