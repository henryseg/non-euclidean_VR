import {
  Thurston,
} from "./thurston.js"

async function test() {
  let thurston = new Thurston('euc');
  await thurston.init();
  thurston.animate();
}

test();
