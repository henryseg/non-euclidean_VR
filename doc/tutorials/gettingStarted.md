This tutorial explains how to build a simple scene with the *Thurston* module. The basics are very similar
to [Three.js](https://threejs.org/). There are some differences though that we will highlight along the way.

Let's start with a basic HTML file `index.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <style>
        html, body {
            margin: 0;
            padding: 0;
        }
    </style>
    <title>My first example</title>
</head>
<body>
</body>
<script type="module" id="main"></script>
</html>
```

All the instruction to generate a scene will be added in the `script` tag at the end of the file. In the remainder of
the tutorial, we assume that the `js` directory of the module is at the same level than the `index.html` file.

# Step 1. Loading the geometry.

The first step is to load the relevant geometry. Implemented geometries are currently E3, S3, H3 and Nil. To implement
another geometry see this other tutorial (todo). For the euclidean geometry it is done as follows.

```javascript
import * as geom from "./js/geometries/euc/geometry/General.js";
```

Next, one need to load a discrete subgroup of isometries. This subgroup corresponds to the fundamental group of the
quotient manifold/orbifold we are working in. In this tutorial we will only work in E3, hence the discrete subgroup is
just the trivial group. It is loaded as follows

```javascript
import trivial from "./js/commons/groups/symbSet.js";
```

# Step 2. Defining a scene, a camera and a renderer.

Before adding object, one needs to define a scene and a camera. Those items are bind together in a renderer whose task
is to dynamically create a shader and run it.

```javascript
// load the relevant library
import {BasicCamera, BasicRenderer, Scene} from "./js/core/General.js";
// initial setup
const camera = new BasicCamera({subgroup: trivial});
const scene = new Scene();
const renderer = new BasicRenderer(geom, trivial, camera, scene);
// adjust the renderer to the size of the screen
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
// add a canvas in the HTML file to display the scene.
document.body.appendChild(renderer.domElement);
```

- The camera takes as an argument the discrete subgroup of isometries we loaded. By default, the position of the camera
  is the origin of the geometry. It points toward the negative z-direction.
- The renderer takes as arguments the geometry, the discrete subgroup the camera and the scene.

# Step 3 Populating the scene

The scene is made of objects which are either solids or lights. Before defining those object, we need to extends our
list of imports with the relevant classes.
In our examples we will also use {@link Point} and `Color` to create the objects.

```javascript
import {PointLight} from "./js/geometries/euc/lights/pointLight/PointLight.js";
import {PhongMaterial} from "./js/commons/material/all.js";
import {Ball} from "./js/geometries/euc/solids/all.js";

import {Color} from "./js/lib/three.module.js";
import {Point} from "./js/core/geometry/Point.js";
```

Then we define all the objects in the scene. Here a single point light, and a ball with a phong material.

```javascript
// A light
const light = new PointLight(
    new Point(-1, 1, -2),
    new Color(0, 1, 1),
);

// Phong shading material
const mat = new PhongMaterial({shininess: 10});

// A ball
const ball = new Ball(
    new Point(-1, -0.5, -2),
    0.3,
    mat
);
```

In general, a solid is a shape with a given material. A solid can be defined using a built-in class (as here).
Alternatively, one can define separately a shape and a material and combine them in a `Solid` object.

Finally one adds those objects to the scene

```javascript
basicScene.add(light, ball);
```

# Step 4 Rendering the scene.

Before rendering the scene, we need to build the underlying shader. This is done as follows

```javascript
basicRenderer.build();
```
Note that every object added to the scene after this function has been called will not be taken into account.


Then we define a function that is called at each frame.

```javascript
function animate() {
  basicRenderer.render();
}
```

Here we just call the `render()` method of our renderer. 
We can elaborate to animate the scene, handle events, etc.

Finally, we define the animation loop

```javascript
basicRenderer.setAnimationLoop(animate);
```

A usefull command to add when debugging is

````javascript
basicRenderer.checkShader();
````

It displays in the log the shader built by the renderer.

# Step 5. Summary
    
The complete `index.html` file is

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <style>
        html, body {
            margin: 0;
            padding: 0;
        }
    </style>
    <title>My first example</title>
</head>
<body>
</body>
<script type="module" id="main">
  import {Color} from "./js/lib/three.module.js";
  
  import * as geom from "./js/geometries/euc/geometry/General.js";
  import trivial from "./js/commons/groups/symbSet.js";

  import {BasicCamera, BasicRenderer, Scene} from "./js/core/General.js";

  import {Point} from "./js/core/geometry/Point.js";
  import {PointLight} from "./js/geometries/euc/lights/pointLight/PointLight.js";
  import {PhongMaterial} from "./js/commons/material/all.js";
  import {Ball} from "./js/geometries/euc/solids/all.js";
  
  // initial setup
  const camera = new BasicCamera({subgroup: trivial});
  const scene = new Scene();
  const renderer = new BasicRenderer(geom, trivial, camera, scene);
  // adjust the renderer to the size of the screen
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  // add a canvas in the HTML file to display the scene.
  document.body.appendChild(renderer.domElement);

  // A light
  const light = new PointLight(
          new Point(-1, 1, -2),
          new Color(0, 1, 1),
  );
  // Phong shading material
  const mat = new PhongMaterial({shininess: 10});
  // A ball
  const ball = new Ball(
          new Point(-1, -0.5, -2),
          0.3,
          mat
  );

  scene.add(light, ball);
  
  renderer.build();
  function animate() {
    renderer.render();
  }
  renderer.setAnimationLoop(animate);
  renderer.checkShader();
</script>
</html>
```
    


