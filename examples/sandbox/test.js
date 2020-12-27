const a = true;
const b = false;

switch([a,b]) {
    case [true, true]:
        console.log('t,t');
        break;
    case [true, false]:
        console.log('t,f');
        break;
    default:
        console.log('d', [a,b]);
}