let start = Date.now();
let counter = 0;

// tight loop, very scary
while ((Date.now() - start) < 50) {
  counter++
}

export default counter;
