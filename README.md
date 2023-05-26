# Ray-marching in Thurston geometries

This project started from the ray marching hyperbolic virtual
reality [simulation](https://github.com/mtwoodard/hypVR-Ray_m) (for mobile devices) by Henry Segerman and Michael
Woodard,
which is in turn based on the full [simulation](https://github.com/mtwoodard/hypVR-Ray).

This version is as independent of the underlying geometry as possible.
It comes with an API to

- build and animate scenes in a given geometry
- define objects, lights, materials, etc
- implement new geometries (or new models of existing geometries)

This project started at the *Illustrating Mathematics* semester program at [ICERM](https://icerm.brown.edu).

Visit the website https://3-dimensional.space for demos, math explanations, and documentation.

## Examples

The project contains numerous ready to use examples.
It contains scenes in the various geometries and demonstrates the features of the API.
To run the examples on your own computer, you need a local server.

### Running a local server

- Download the project (for a basic usage the `dist` directory is enough)
- Start a local server making sure that the root of the server correspond to the `dist`.
  This can be easily done with Python 3 using the command
  ```zsh
  python -m http.server
  ``` 
- With a browser, visit the page `http://http://localhost:8000/examples/index.html`
  (adapt the URL depending on your local server)
- Enjoy!

### Exploring the examples

The examples tagged with *(VR)* are made for virtual reality. They should work with any VR headset supported by the
three.js library.
When loaded, those examples have a button *Enter VR* at the bottom on the screen.
Clicking this button should launch the simulation in the VR headset (you may first need to allow your browser to
interact with the VR system).

Items flagged with *(PT)* incorporate a path tracer. Hit `p` to launch the path tracer.

The default controls are the following.

| Command            | QWERTY keyboard | AZERTY keyboard |
|--------------------|-----------------|-----------------|
| Yaw left           | `a`             | `q`             |
| Yaw right          | `d`             | `d`             |
| Pitch up           | `w`             | `z`             |
| Pitch down         | `s`             | `s`             |
| Roll left          | `q`             | `a`             |
| Roll right         | `e`             | `e`             |
| Move forward       | `arrow up`      | `arrow up`      |
| Move backward      | `arrow down`    | `arrow down`    |
| Move to the left   | `arrow left`    | `arrow left`    |
| Move the the right | `arrow right`   | `arrow right`   |
| Move upwards       | `'`             | `ù`             |
| Move downwards     | `/`             | `=`             |

## Building your own scene

To build your own scene, visit the tutorials from the documentation.
You can also browse the examples.

## Development

If you extend the project, you need to install the library with [npm](https://www.npmjs.com/).
You must first install this tools following the instructions for your operating system.
(On Mac one can use [homebrew](https://brew.sh/) to install npm.)

### Installation

- clone the git repository of `non-euclidean-vr`
- install the dependencies with the command
  ```zsh
  npm install
  ```

### Build

The packages are built with [webpack](https://webpack.js.org/).
The builder is configured to produce one file for each geometry (with a name of the form `thrustonXXX.js`).
The module exposed for each geometry are defined in the files `/src/thursontXXX.js`.
The command to build the packages is

```zsh
npm run build
```

### Development environment

In a development phase, one can use webpack dev server.
Run the command

```zsh
npm run dev
```

The webpack dev server will serve the content of the `dev` directory at the address  `http://localhost:9000/`
Any change in the code will be updated automatically (without having to rebuild the code).

To update the documentation (compiled from docstrings), run the command

```zsh
npm run doc
```

## License

Released under the terms of the GNU [General Public License](https://www.gnu.org/licenses/gpl-3.0.en.html), version 3 or
later.

## Main contributors

(alphabetical order)

- **Rémi Coulon** [@remi-coulon](https://github.com/remi-coulon)

  Rémi Coulon is partially supported by the *Centre Henri Lebesgue* ANR-11-LABX-0020-01
  and the Agence Nationale de la Recherche under Grant *Dagger* ANR-16-CE40- 0006-01.
- **Sabetta Matsumoto** [@sabetta](https://github.com/sabetta)

  Sabetta Matsumoto is partially supported by NSF grant DMR-1847172 and the Research Corporation for Scientific
  Advancement.

- **Henry Segerman** [@henryseg](https://github.com/henryseg)

  Henry Segerman is partially supported by NSF grant DMS-1708239.

- **Steve Trettel** [@stevejtrettel](https://github.com/stevejtrettel)

Any opinions, findings, and conclusions or recommendations expressed in this material are those of the author(s) and do
not necessarily reflect the views of the National Science Foundation.
