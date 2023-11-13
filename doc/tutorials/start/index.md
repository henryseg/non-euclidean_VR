# Getting started


This tutorial explains how to build a simple scene with the *3DS* module. The basics are very similar
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

At each step of the tutorial, we highlight the additional lines of code needed to perform the described action.
The complete script can be found at the end of this tutorial.

## Step 0. Declaring required modules / Choosing a geometry.

Beside the 3DS module, the application relies on several 3d-party JavaScript modules (Three.js in particular).
There are several options to load them.
We use here the "import-map" specification.
Since this feature is not supported by all browser, it requires a polyfill.
In practice the following should be added in the header

```html

<script async src="vendor/es-module-shims.js"></script>
<script type="importmap">
    {
        "imports": {
            "three": "vendor/three.module.js",
            "3ds": "3ds/3dsEuc.js"
        }
    }
</script>
```

### Remarks

- In this example we assume that the directories `vendor` and `3ds` are at the same level as the `index.html` file.
- For the moment, all the modules need be declared (even if we are not using them).
- The names in the import map ('three', '3ds', etc) cannot be changed.

### Geometry.

In the above example, we have chosen a geometry, via the module `3dsEuc.js`.
Indeed, all the tools for each geometry are wrapped in a single file with the name `3dsXXX.js` where `XXX` has the
following meaning.

| XXX | Geometry                                          |
|-----|---------------------------------------------------|
| Euc | $\mathbb E^3$ (euclidean geometry)                |     
| Hyp | $\mathbb H^3$ (hyperbolic geometry)               |     
| Sph | $S^3$ (spherical geometry)                        |     
| S2E | $S^2 \times \mathbb E$ (product geometry)         |   
| H2E | $\mathbb H^2 \times \mathbb E$ (product geometry) |   
| Nil | Nil                                               |         
| SL2 | The universal cover of ${\rm SL}(2,\mathbb R)$    |
| Sol | Sol                                               |

From now on, all the instructions to generate a scene will be added in the `script` tag identify as `main`.

## Step 1. Choosing a discrete group.

Next, one need to load a discrete subgroup of isometries.
This subgroup corresponds to the fundamental group of the quotient manifold/orbifold we are working in.
In this tutorial we will only work in E^3, hence the discrete subgroup is just the trivial group.
It is loaded as follows

```javascript
import {trivialSet as set} from "3ds";
```

## Step 2. Defining a scene, a camera and a renderer.

Before adding object, one needs to define a scene and a camera. Those items are bind together in a renderer whose task
is to dynamically create a shader and run it.

```javascript
import {BasicCamera, BasicRenderer, Scene} from "3ds";

// ...

// initial setup
const camera = new BasicCamera({set: set});
const scene = new Scene();
const renderer = new BasicRenderer(camera, scene, {}, {
    logarithmicDepthBuffer: true
});
// adjust the renderer to the size of the screen
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
// add a canvas in the HTML file to display the scene.
document.body.appendChild(renderer.domElement);
```

- The camera takes as an argument the discrete subgroup of isometries we loaded. By default, the position of the camera
  is the origin of the geometry. It points toward the negative z-direction (in a preferred frame in the tangent space at
  the origin).
- The renderer takes as arguments the discrete subgroup, the camera and the scene.

## Step 3 Populating the scene

The scene is made of objects which are either solids or lights.
Before defining those object, we need to extend our list of imports with the relevant classes.
In our examples we will also use {@link Point}
as well as the [Color](https://threejs.org/docs/index.html#api/en/math/Color) implementation from Three.js.

```javascript
import {
    PointLight,
    PhongMaterial,
    Ball,
    Point
} from "3ds";
import {Color} from "three";
```

Then we define all the objects in the scene. Here a single point light, and a ball with a phong material.

```javascript
// A light
const light = new PointLight(
    new Point(-1, 1, -2),
    new Color(0, 1, 1),
    0.5,
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

The light has three arguments here (it can be different for another kind of lights or another geometry): its location,
its colors and its intensity

The phong material accepts various parameters (see the doc)

In general, a solid is a shape with a given material. A solid can be defined using a built-in class (as here).
Alternatively, one can define separately a shape and a material and combine them in a {@link Solid} object.

Finally, one adds those objects to the scene

```javascript
scene.add(light, ball);
```

## Step 4 Rendering the scene.

Before rendering the scene, we need to build the underlying shader. This is done as follows

```javascript
renderer.build();
```

Note that every object added to the scene after this function has been called will not be taken into account.

Then we define a function that is called at each frame.

```javascript
function animate() {
    renderer.render();
}
```

Here we just call the `render()` method of our renderer. We can elaborate to animate the scene, handle events, etc.

Finally, we define the animation loop

```javascript
renderer.setAnimationLoop(animate);
```

A useful command to add when debugging is

````javascript
renderer.checkShader();
````

It displays in the log the shader built by the renderer.

## Step 5. Summary

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

    <!-- Import maps polyfill -->
    <!-- Remove this when import maps will be widely supported -->
    <script async src="vendor/es-module-shims.js"></script>
    <script type="importmap">
    {
        "imports": {
            "three": "vendor/three.module.js",
            "3ds": "3ds/3dsEuc.js"
        }
    }
    </script>
</head>

<body>
</body>

<script type="module" id="main">
    import {
        trivialSet as set
        BasicCamera, BasicRenderer, Scene,
        PointLight,
        Point,
        PhongMaterial,
        Ball
    } from "3ds";
    import {Color} from "three";

    // initial setup
    const camera = new BasicCamera({set: set});
    const scene = new Scene();
    const renderer = new BasicRenderer(camera, scene);
    // adjust the renderer to the size of the screen
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    // add a canvas in the HTML file to display the scene.
    document.body.appendChild(renderer.domElement);

    // A light
    const light = new PointLight(
            new Point(-1, 1, -2),
            new Color(0, 1, 1),
            0.5
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
    



    


